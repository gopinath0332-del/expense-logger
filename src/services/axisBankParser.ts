import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { RawBankRow, ImportedTransaction } from '@/types/pdfImport'
import type { CategoryOption } from '@/types/category'
import type { AccountOption } from '@/types/account'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
}

// Category keyword mapping table
export interface CategoryKeywordRule {
  keywords: string[]
  categoryId: string
  subcategoryId?: string
}

export const CATEGORY_KEYWORD_RULES: CategoryKeywordRule[] = [
  {
    keywords: ['swiggy', 'zomato', 'restaurant', 'hotel', 'bhavan', 'chettinadu', 'dhaba', 'canteen', 'cafe', 'food', 'bakery', 'sweets'],
    categoryId: 'food',
    subcategoryId: 'restaurant'
  },
  {
    keywords: ['grocery', 'supermarket', 'mart', 'store', 'kirana', 'pazhamudhir', 'fruit', 'vegetable', 'milk', 'smart point', 'jiomart', 'blinkit', 'instamart', 'zepto', 'bigbasket'],
    categoryId: 'food',
    subcategoryId: 'groceries'
  },
  {
    keywords: ['mcdonald', 'kfc', 'burger', 'pizza', 'domino', 'subway'],
    categoryId: 'food',
    subcategoryId: 'fast-food'
  },
  {
    keywords: ['tea', 'coffee', 'beverage', 'juice', 'chai'],
    categoryId: 'food',
    subcategoryId: 'beverages'
  },
  {
    keywords: [
      'petro',
      'petrol',
      'fuel',
      'diesel',
      'hsd',
      'cng',
      'indian oil',
      'indianoil',
      'hpcl',
      'bpcl',
      'shell',
      'iocl',
      'bharat petroleum',
      'hindustan petroleum',
      'gas station',
      'petroleum'
    ],
    categoryId: 'transportation',
    subcategoryId: 'fuel'
  },
  {
    keywords: ['uber', 'ola', 'rapido', 'irctc', 'redbus', 'toll', 'fastag', 'parking', 'metro', 'taxi', 'cab', 'auto'],
    categoryId: 'transportation'
  },
  {
    keywords: ['pharmacy', 'hospital', 'clinic', 'medical', 'apollo', 'med', 'health', 'doctor', 'diagnostic', 'lab'],
    categoryId: 'health'
  },
  {
    keywords: ['cinema', 'movie', 'bookmyshow', 'theatre', 'netflix', 'spotify', 'prime video', 'hotstar', 'entertainment'],
    categoryId: 'culture'
  },
  {
    keywords: ['beauty', 'salon', 'parlour', 'cosmetic', 'spa', 'hair'],
    categoryId: 'beauty'
  },
  {
    keywords: ['apparel', 'clothing', 'trends', 'zudio', 'textile', 'silks', 'myntra', 'fashion'],
    categoryId: 'apparel'
  },
  {
    keywords: ['book', 'course', 'udemy', 'coursera', 'training', 'workshop', 'tuition', 'education', 'school', 'college'],
    categoryId: 'education'
  },
  {
    keywords: ['electricity', 'water', 'gas', 'broadband', 'wifi', 'rent', 'maintenance'],
    categoryId: 'household'
  },
  {
    keywords: ['amazon', 'flipkart', 'meesho', 'purchase', 'shopping'],
    categoryId: 'other'
  },
  {
    keywords: ['zerodha', 'groww', 'upstox', 'angelone', 'angel one', 'kite', 'sharekhan', 'motilal', 'mutual fund', 'investment', 'stocks'],
    categoryId: 'investment'
  }
]

export class AxisBankParser {
  /**
   * Extract text items from all pages of an ArrayBuffer
   */
  async extractTextItems(arrayBuffer: ArrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true
    })
    const pdf = await loadingTask.promise
    return pdf
  }

  /**
   * Parse Axis Bank Statement from ArrayBuffer
   */
  async parsePdf(arrayBuffer: ArrayBuffer): Promise<RawBankRow[]> {
    const pdf = await this.extractTextItems(arrayBuffer)
    const allRows: RawBankRow[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()

      // Normalize items
      const items = content.items
        .map((item: unknown) => {
          const textItem = item as { str: string; transform: number[] }
          return {
            str: textItem.str ? textItem.str.trim() : '',
            x: Math.round(textItem.transform[4]),
            y: Math.round(textItem.transform[5])
          }
        })
        .filter((item) => item.str.length > 0)

      // Group items by line (y-coordinate with +- 3px tolerance)
      const linesMap: { y: number; items: typeof items }[] = []
      items.sort((a, b) => b.y - a.y || a.x - b.x)

      for (const item of items) {
        const existingLine = linesMap.find((l) => Math.abs(l.y - item.y) <= 3)
        if (existingLine) {
          existingLine.items.push(item)
          existingLine.items.sort((a, b) => a.x - b.x)
        } else {
          linesMap.push({ y: item.y, items: [item] })
        }
      }

      // Sort lines from top to bottom
      linesMap.sort((a, b) => b.y - a.y)

      let pendingNarration: string[] = []

      for (const line of linesMap) {
        const lineStr = line.items.map((it) => it.str).join(' ')

        // Skip headers and metadata lines
        if (
          lineStr.includes('Tran Date') ||
          lineStr.includes('Statement of Axis') ||
          lineStr.includes('OPENING BALANCE')
        ) {
          continue
        }

        // Detect Date item: x: 30-70 and format DD-MM-YYYY
        const dateItem = line.items.find(
          (it) => it.x >= 30 && it.x <= 70 && /^\d{2}-\d{2}-\d{4}$/.test(it.str)
        )

        // Particulars / narration items: x between 90 and 335
        const particularItems = line.items.filter(
          (it) => it.x >= 90 && it.x <= 335 && !/^\d{2}-\d{2}-\d{4}$/.test(it.str)
        )
        const lineParticulars = particularItems.map((it) => it.str).join(' ')

        if (!dateItem) {
          // Check if this line is part of a multi-line narration
          if (
            lineParticulars &&
            !lineStr.includes('Page') &&
            !lineStr.includes('Branch') &&
            !lineStr.includes('Registered') &&
            !lineStr.includes('Customer ID') &&
            !lineStr.includes('LEGEND')
          ) {
            pendingNarration.push(lineParticulars)
          }
          continue
        }

        // This line contains a date. Check for amounts:
        // Debit: x ~ 335-385
        // Credit: x ~ 390-450
        // Balance: x ~ 460-525
        const debitItem = line.items.find(
          (it) => it.x >= 335 && it.x <= 385 && /^[\d,]+(\.\d{2})?$/.test(it.str.replace(/,/g, ''))
        )
        const creditItem = line.items.find(
          (it) => it.x >= 390 && it.x <= 450 && /^[\d,]+(\.\d{2})?$/.test(it.str.replace(/,/g, ''))
        )
        const balanceItem = line.items.find(
          (it) => it.x >= 460 && it.x <= 525 && /^[\d,]+(\.\d{2})?$/.test(it.str.replace(/,/g, ''))
        )

        // Also check for Cheque/Ref No: x ~ 75-125
        const chqItem = line.items.find(
          (it) => it.x >= 75 && it.x <= 125 && it.str !== '-' && !/^\d{2}-\d{2}-\d{4}$/.test(it.str)
        )

        if (debitItem) {
          if (lineParticulars) {
            pendingNarration.push(lineParticulars)
          }
          const fullNarration = pendingNarration.join(' ').trim()
          pendingNarration = []

          allRows.push({
            date: dateItem.str,
            narration: fullNarration,
            chequeRef: chqItem ? chqItem.str : '',
            debit: parseFloat(debitItem.str.replace(/,/g, '')),
            credit: null,
            balance: balanceItem ? parseFloat(balanceItem.str.replace(/,/g, '')) : null
          })
        } else if (creditItem) {
          // Skip credit/income transactions and clear pending narration
          pendingNarration = []
        }
      }
    }

    return allRows
  }

  /**
   * Convert DD-MM-YYYY to YYYY-MM-DD
   */
  parseDate(rawDate: string): string {
    const parts = rawDate.split('-')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return rawDate
  }

  /**
   * Extract cleaner readable description from raw narration
   */
  cleanDescription(narration: string): string {
    if (!narration) return ''

    // UPI format: UPI/P2M/REF/MERCHANT /Paymen/... or UPI/P2A/REF/BENEFICIARY/...
    if (narration.startsWith('UPI/')) {
      const parts = narration.split('/')
      if (parts.length >= 4) {
        let party = parts[3].trim()
        if (parts[4] && !parts[4].toLowerCase().includes('paymen') && !parts[4].toLowerCase().includes('remark')) {
          party = `${party} ${parts[4].trim()}`
        }
        return party.replace(/\s+/g, ' ').trim()
      }
    }

    // NEFT format: NEFT/SBIN.../BENEFICIARY/STATE BANK OF...
    if (narration.startsWith('NEFT/')) {
      const parts = narration.split('/')
      if (parts.length >= 3) {
        return parts[2].trim()
      }
    }

    // ACH format: ACH-DR-IDFC FIRST BANK-...
    if (narration.startsWith('ACH-')) {
      const parts = narration.split('-')
      if (parts.length >= 3) {
        return parts.slice(1, 4).join(' ').trim()
      }
    }

    // Salary format: CHARTERED B/Salary Cr Jul-26
    if (narration.includes('/')) {
      const segments = narration.split('/').map((s) => s.trim()).filter(Boolean)
      if (segments.length > 1) {
        return segments.slice(0, 2).join(' - ')
      }
    }

    return narration.slice(0, 60).trim()
  }

  /**
   * Helper to check word match in text (handles punctuation, slashes, boundaries)
   */
  private matchWord(text: string, term: string): boolean {
    if (!term || term.length < 3) return false
    const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
    return regex.test(text)
  }

  /**
   * Detect category & subcategory from narration
   */
  detectCategory(
    narration: string,
    categories: CategoryOption[]
  ): { categoryId: string; subcategoryId?: string } {
    const lower = narration.toLowerCase()

    // 1. Dynamic Matching against User's Category List:
    // First, check if narration matches any subcategory label or id
    for (const cat of categories) {
      if (!cat.subcategories) continue
      for (const sub of cat.subcategories) {
        if (this.matchWord(lower, sub.label) || this.matchWord(lower, sub.id)) {
          return { categoryId: cat.id, subcategoryId: sub.id }
        }
      }
    }

    // Second, check if narration matches any main category label or id (skip generic 'other')
    for (const cat of categories) {
      if (cat.id === 'other' || cat.label.toLowerCase() === 'other') continue
      if (this.matchWord(lower, cat.label) || this.matchWord(lower, cat.id)) {
        return { categoryId: cat.id }
      }
    }

    // 2. Pre-configured Keyword Rules:
    for (const rule of CATEGORY_KEYWORD_RULES) {
      const matched = rule.keywords.some((keyword) => lower.includes(keyword))
      if (matched) {
        const cat = categories.find((c) => c.id === rule.categoryId)
        if (cat) {
          if (rule.subcategoryId) {
            const sub = cat.subcategories?.find(
              (s) =>
                s.id.toLowerCase() === rule.subcategoryId?.toLowerCase() ||
                s.label.toLowerCase() === rule.subcategoryId?.toLowerCase()
            )
            if (sub) {
              return { categoryId: cat.id, subcategoryId: sub.id }
            }
          }
          return { categoryId: cat.id }
        }
      }
    }

    // 3. Fallback: search for 'other'
    const otherCat = categories.find((c) => c.id === 'other')
    if (otherCat) {
      return { categoryId: otherCat.id }
    }

    // If no other category found, return first available
    return { categoryId: categories[0]?.id || 'other' }
  }

  /**
   * Detect payment account from narration
   */
  detectAccount(narration: string, accounts: AccountOption[]): string {
    const lower = narration.toLowerCase()

    if (lower.startsWith('upi') || lower.includes('upi')) {
      const upiAcc = accounts.find((a) => a.id === 'upi')
      if (upiAcc) return upiAcc.id
    }

    if (lower.startsWith('ach') || lower.startsWith('neft') || lower.includes('bank')) {
      const bankAcc = accounts.find((a) => a.id === 'bank')
      if (bankAcc) return bankAcc.id
    }

    // Default to bank or first account
    const bankDefault = accounts.find((a) => a.id === 'bank')
    return bankDefault?.id || accounts[0]?.id || 'bank'
  }

  /**
   * Map raw rows into ImportedTransaction objects ready for user review
   */
  mapToImportedTransactions(
    rawRows: RawBankRow[],
    categories: CategoryOption[],
    accounts: AccountOption[],
    existingFingerprints: Set<string> = new Set()
  ): ImportedTransaction[] {
    // Only capture expense/debit rows
    const debitRows = rawRows.filter((row) => row.debit !== null && row.debit > 0)

    return debitRows.map((row, index) => {
      const amount = row.debit ?? 0
      const type = 'expense' as const
      const formattedDate = this.parseDate(row.date)
      const description = this.cleanDescription(row.narration)

      const { categoryId, subcategoryId } = this.detectCategory(row.narration, categories)
      const accountId = this.detectAccount(row.narration, accounts)

      // Duplicate fingerprint: date_amount_type_description
      const fingerprint = `${formattedDate}_${amount}_${type}_${description.toLowerCase()}`
      const isDuplicate = existingFingerprints.has(fingerprint)

      return {
        importId: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        date: formattedDate,
        type,
        category: categoryId,
        subcategory: subcategoryId || '',
        account: accountId,
        description,
        note: row.narration,
        amount,
        rawNarration: row.narration,
        isDuplicate
      }
    })
  }
}
