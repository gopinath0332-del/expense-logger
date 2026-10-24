import { describe, it, expect } from 'vitest'
import '@/polyfills'
import { AxisBankParser } from '@/services/axisBankParser'

describe('Browser polyfills', () => {
  it('polyfils Promise.withResolvers when missing', () => {
    expect(typeof (Promise as unknown as { withResolvers: unknown }).withResolvers).toBe('function')
    const { promise, resolve, reject } = (Promise as unknown as { withResolvers: <T>() => { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } }).withResolvers<number>()
    expect(promise).toBeInstanceOf(Promise)
    expect(typeof resolve).toBe('function')
    expect(typeof reject).toBe('function')
  })

  it('polyfils ReadableStream async iterator', async () => {
    expect(ReadableStream.prototype[Symbol.asyncIterator]).toBeDefined()

    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue('chunk1')
        controller.enqueue('chunk2')
        controller.close()
      }
    })

    const chunks: string[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual(['chunk1', 'chunk2'])
  })
})

describe('AxisBankParser helpers', () => {
  const parser = new AxisBankParser()

  it('correctly parses dates from DD-MM-YYYY to YYYY-MM-DD', () => {
    expect(parser.parseDate('24-07-2024')).toBe('2024-07-24')
    expect(parser.parseDate('01-01-2025')).toBe('2025-01-01')
  })

  it('cleans UPI narration into readable description', () => {
    const rawUpi = 'UPI/P2M/420783129841/SWIGGY/Paymen/01'
    expect(parser.cleanDescription(rawUpi)).toBe('SWIGGY')
  })
})
