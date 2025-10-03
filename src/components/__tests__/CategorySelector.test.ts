import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CategorySelector from '@/components/CategorySelector.vue'

// Mock Firebase
vi.mock('@/firebase', () => ({
  addCategoryOption: vi.fn().mockResolvedValue(undefined),
  updateCategoryOption: vi.fn().mockResolvedValue(undefined)
}))

describe('CategorySelector', () => {
  const mockCategories = [
    {
      id: 'food',
      label: 'Food',
      subcategories: [
        { id: 'restaurant', label: 'Restaurant' },
        { id: 'groceries', label: 'Groceries' }
      ]
    },
    {
      id: 'transport',
      label: 'Transportation'
    }
  ]

  it('should render category options', () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    expect(wrapper.find('.modal-title').text()).toBe('Category')
    expect(wrapper.findAll('.category-item')).toHaveLength(2) // 2 category items
    expect(wrapper.findAll('.add-new-btn')).toHaveLength(1) // 1 add new button
  })

  it('should show add new category button', () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    const addNewBtn = wrapper.find('.add-new-btn')
    expect(addNewBtn.exists()).toBe(true)
    expect(addNewBtn.text()).toContain('Add New')
  })

  it('should show add category form when add new is clicked', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    await wrapper.find('.add-new-btn').trigger('click')

    expect(wrapper.find('.add-category-form').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toBe('Add New Category')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('should navigate to subcategories for categories that have them', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Click on Food category which has subcategories
    const foodBtn = wrapper.findAll('.category-btn')[0]
    await foodBtn.trigger('click')

    expect(wrapper.find('.modal-title').text()).toBe('Food')
    expect(wrapper.findAll('.category-btn')).toHaveLength(4) // parent + 2 subcategories + add new
  })

  it('should emit select event for categories without subcategories', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Click on Transportation category which has no subcategories
    const transportBtn = wrapper.findAll('.category-btn')[1]
    await transportBtn.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockCategories[1]])
  })

  it('should show add subcategory button in subcategory view', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Navigate to Food subcategories
    const foodBtn = wrapper.findAll('.category-btn')[0]
    await foodBtn.trigger('click')

    const addNewBtn = wrapper.find('.add-new-btn')
    expect(addNewBtn.exists()).toBe(true)
    expect(addNewBtn.text()).toContain('Add New')
  })

  it('should show add subcategory form when add new subcategory is clicked', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Navigate to Food subcategories
    const foodBtn = wrapper.findAll('.category-btn')[0]
    await foodBtn.trigger('click')

    // Click add new subcategory
    await wrapper.find('.add-new-btn').trigger('click')

    expect(wrapper.find('.add-subcategory-form').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toBe('Add Subcategory to Food')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('should validate category name input', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Open add category form
    await wrapper.find('.add-new-btn').trigger('click')

    // Try to save without name
    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.find('.error-message').text()).toBe('Category name is required')
  })

  it('should validate subcategory name input', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Navigate to Food subcategories
    const foodBtn = wrapper.findAll('.category-btn')[0]
    await foodBtn.trigger('click')

    // Open add subcategory form
    await wrapper.find('.add-new-btn').trigger('click')

    // Try to save without name
    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.find('.error-message').text()).toBe('Subcategory name is required')
  })

  it('should detect duplicate subcategory names', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Navigate to Food subcategories
    const foodBtn = wrapper.findAll('.category-btn')[0]
    await foodBtn.trigger('click')

    // Open add subcategory form
    await wrapper.find('.add-new-btn').trigger('click')

    // Try to add duplicate subcategory
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Restaurant') // Already exists

    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.find('.error-message').text()).toBe('This subcategory already exists')
  })

  it('should handle back navigation correctly', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Open add category form
    await wrapper.find('.add-new-btn').trigger('click')
    expect(wrapper.find('.add-category-form').exists()).toBe(true)

    // Go back
    await wrapper.find('.back-btn').trigger('click')
    expect(wrapper.find('.add-category-form').exists()).toBe(false)
    expect(wrapper.find('.modal-title').text()).toBe('Category')
  })

  it('should emit refresh event after adding category', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Open add category form
    await wrapper.find('.add-new-btn').trigger('click')

    // Enter category name
    const input = wrapper.find('input[type="text"]')
    await input.setValue('New Category')

    // Save category
    await wrapper.find('.btn-primary').trigger('click')

    // Wait for async operation
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('refresh')).toBeTruthy()
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('should show add subcategory button for categories without subcategories', () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Transportation category (index 1) has no subcategories, should show add button
    const categoryItems = wrapper.findAll('.category-item')
    const transportationItem = categoryItems[1]

    expect(transportationItem.find('.add-subcategory-to-category-btn').exists()).toBe(true)
  })

  it('should not show add subcategory button for categories with subcategories', () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Food category (index 0) has subcategories, should not show add button
    const categoryItems = wrapper.findAll('.category-item')
    const foodItem = categoryItems[0]

    expect(foodItem.find('.add-subcategory-to-category-btn').exists()).toBe(false)
  })

  it('should open subcategory form when add subcategory button is clicked', async () => {
    const wrapper = mount(CategorySelector, {
      props: {
        isVisible: true,
        categories: mockCategories
      }
    })

    // Click the add subcategory button for Transportation category
    const categoryItems = wrapper.findAll('.category-item')
    const transportationItem = categoryItems[1]
    await transportationItem.find('.add-subcategory-to-category-btn').trigger('click')

    expect(wrapper.find('.add-subcategory-form').exists()).toBe(true)
    expect(wrapper.find('.modal-title').text()).toBe('Add Subcategory to Transportation')
  })
})
