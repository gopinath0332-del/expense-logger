import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PdfUploadZone from '@/components/import/PdfUploadZone.vue'

describe('PdfUploadZone', () => {
  it('renders upload zone with title, subtitle, and badges', () => {
    const wrapper = mount(PdfUploadZone)

    expect(wrapper.find('.drop-zone-title').text()).toContain('Upload Bank Statement')
    expect(wrapper.find('.drop-zone-subtitle').text()).toContain('Drag and drop')
    expect(wrapper.text()).toContain('PDF only')
    expect(wrapper.text()).toContain('Max 20 MB')
  })

  it('emits file-selected when a valid PDF file is picked', async () => {
    const wrapper = mount(PdfUploadZone)

    const file = new File(['%PDF-1.4 test content'], 'statement.pdf', {
      type: 'application/pdf'
    })

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    })

    await input.trigger('change')

    expect(wrapper.emitted('file-selected')).toBeTruthy()
    expect(wrapper.emitted('file-selected')?.[0]).toEqual([file])
    expect(wrapper.find('.alert-danger').exists()).toBe(false)
  })

  it('shows error and emits error when non-PDF file is selected', async () => {
    const wrapper = mount(PdfUploadZone)

    const file = new File(['dummy content'], 'report.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    })

    await input.trigger('change')

    expect(wrapper.emitted('file-selected')).toBeFalsy()
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.find('.alert-danger').text()).toContain('Invalid file type')
  })

  it('shows error when file exceeds 20 MB limit', async () => {
    const wrapper = mount(PdfUploadZone)

    // Create file mock with size > 20 MB
    const largeFile = new File([''], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', {
      value: 25 * 1024 * 1024,
      writable: false
    })

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [largeFile],
      writable: false
    })

    await input.trigger('change')

    expect(wrapper.emitted('file-selected')).toBeFalsy()
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.find('.alert-danger').text()).toContain('exceeds 20 MB limit')
  })
})
