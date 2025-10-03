import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSelector from '@/components/AccountSelector.vue'

// Mock Firebase
vi.mock('@/firebase', () => ({
  addAccountOption: vi.fn().mockResolvedValue(undefined)
}))

describe('AccountSelector', () => {
  const mockAccounts = [
    { id: 'cash', label: 'Cash', icon: 'bi bi-cash' },
    { id: 'bank', label: 'Bank Account', icon: 'bi bi-bank' }
  ]

  it('should render account options', () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    expect(wrapper.find('.modal-title').text()).toBe('Account')
    expect(wrapper.findAll('.account-btn')).toHaveLength(3) // 2 accounts + add new button
  })

  it('should show add new account button', () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    const addNewBtn = wrapper.find('.add-new-btn')
    expect(addNewBtn.exists()).toBe(true)
    expect(addNewBtn.text()).toContain('Add New')
  })

  it('should show add account form when add new is clicked', async () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    await wrapper.find('.add-new-btn').trigger('click')

    expect(wrapper.find('.add-account-form').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toBe('Add New Account')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('should emit select event when account is clicked', async () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    await wrapper.findAll('.account-btn')[0].trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockAccounts[0]])
  })

  it('should validate account name input', async () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    // Open add form
    await wrapper.find('.add-new-btn').trigger('click')

    // Try to save without name
    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.find('.error-message').text()).toBe('Account name is required')
  })

  it('should allow icon selection', async () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    // Open add form
    await wrapper.find('.add-new-btn').trigger('click')

    // Check that many icons are available
    const iconBtns = wrapper.findAll('.icon-btn')
    expect(iconBtns.length).toBeGreaterThan(50) // Should have 60+ icons now

    // Click on an icon
    await iconBtns[1].trigger('click')

    expect(iconBtns[1].classes()).toContain('active')
  })

  it('should filter icons based on search', async () => {
    const wrapper = mount(AccountSelector, {
      props: {
        isVisible: true,
        accounts: mockAccounts
      }
    })

    // Open add form
    await wrapper.find('.add-new-btn').trigger('click')

    // Get initial icon count
    const initialIconCount = wrapper.findAll('.icon-btn').length

    // Search for specific icons
    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('wallet')

    // Should have fewer icons after search
    const filteredIconCount = wrapper.findAll('.icon-btn').length
    expect(filteredIconCount).toBeLessThan(initialIconCount)
    expect(filteredIconCount).toBeGreaterThan(0)
  })
})
