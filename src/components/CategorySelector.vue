<template>
  <!-- Category Selector Modal -->
  <div v-if="isVisible" class="category-modal-overlay" @click="closeModal">
    <div class="category-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <button
          v-if="showingSubcategories || showAddCategoryForm || showAddSubcategoryForm"
          class="back-btn"
          @click="goBack"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <h5 class="modal-title">
          {{ getModalTitle() }}
        </h5>

        <!-- Mode Toggle (only show in main category view) -->
        <div v-if="!showingSubcategories && !showAddCategoryForm && !showAddSubcategoryForm" class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: !isManageMode }"
            @click="isManageMode = false"
          >
            Select
          </button>
          <button
            class="mode-btn"
            :class="{ active: isManageMode }"
            @click="isManageMode = true"
          >
            Manage
          </button>
        </div>

        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Add Category Form -->
      <div v-if="showAddCategoryForm" class="add-category-form">
        <div class="form-group">
          <label for="categoryName">Category Name</label>
          <input
            id="categoryName"
            v-model="newCategory.label"
            type="text"
            class="form-control"
            placeholder="Enter category name"
            maxlength="50"
            @keyup.enter="saveNewCategory"
          />
          <div v-if="categoryError" class="error-message">{{ categoryError }}</div>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelAddCategory">Cancel</button>
          <button class="btn btn-primary" @click="saveNewCategory" :disabled="!newCategory.label.trim()">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            Add Category
          </button>
        </div>
      </div>

      <!-- Add Subcategory Form -->
      <div v-else-if="showAddSubcategoryForm" class="add-subcategory-form">
        <div class="form-group">
          <label for="subcategoryName">Subcategory Name</label>
          <input
            id="subcategoryName"
            v-model="newSubcategory.label"
            type="text"
            class="form-control"
            placeholder="Enter subcategory name"
            maxlength="50"
            @keyup.enter="saveNewSubcategory"
          />
          <div v-if="subcategoryError" class="error-message">{{ subcategoryError }}</div>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelAddSubcategory">Cancel</button>
          <button class="btn btn-primary" @click="saveNewSubcategory" :disabled="!newSubcategory.label.trim()">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
            Add Subcategory
          </button>
        </div>
      </div>

      <!-- Categories or Subcategories Grid -->
      <div v-else class="category-grid">
        <!-- Main Categories -->
        <template v-if="!showingSubcategories">
          <!-- Select Mode: Normal category selection -->
          <template v-if="!isManageMode">
            <button
              v-for="category in categories"
              :key="category.id"
              class="category-btn"
              :class="{
                active: selectedCategory === category.id && !selectedSubcategory,
                'has-subcategories': category.subcategories && category.subcategories.length > 0
              }"
              @click="handleCategoryClick(category)"
              :title="getCategoryTooltip(category)"
            >
              {{ category.label }}
              <i v-if="category.subcategories && category.subcategories.length > 0"
                 class="bi bi-chevron-right subcategory-arrow"></i>
            </button>
          </template>

          <!-- Manage Mode: Category management with action buttons -->
          <template v-else>
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-manage-item"
            >
              <div class="category-info">
                <span class="category-name">{{ category.label }}</span>
                <span v-if="category.subcategories && category.subcategories.length > 0" class="subcategory-count">
                  {{ category.subcategories.length }} subcategories
                </span>
                <span v-else class="no-subcategories">No subcategories</span>
              </div>
              <div class="category-actions">
                <button
                  v-if="category.subcategories && category.subcategories.length > 0"
                  class="action-btn view-btn"
                  @click="viewCategorySubcategories(category)"
                  title="View subcategories"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  class="action-btn add-sub-btn"
                  @click="addSubcategoryToCategory(category)"
                  title="Add subcategory"
                >
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>
          </template>

          <!-- Add New Category Button -->
          <button
            class="category-btn add-new-btn"
            @click="showAddCategoryForm = true"
          >
            <i class="bi bi-plus-circle"></i>
            <span>Add New</span>
          </button>
        </template>

        <!-- Subcategories -->
        <template v-else>
          <!-- Option to select parent category without subcategory -->
          <button
            class="category-btn parent-option"
            :class="{ active: selectedCategory === selectedParentCategory?.id && !selectedSubcategory }"
            @click="selectParentOnly"
          >
            {{ selectedParentCategory?.label }}
            <small class="parent-label">General</small>
          </button>

          <!-- Subcategories -->
          <button
            v-for="subcategory in selectedParentCategory?.subcategories"
            :key="subcategory.id"
            class="category-btn"
            :class="{ active: selectedSubcategory === subcategory.id }"
            @click="selectSubcategory(subcategory)"
          >
            {{ subcategory.label }}
          </button>

          <!-- Add New Subcategory Button -->
          <button
            class="category-btn add-new-btn"
            @click="showAddSubcategoryForm = true"
          >
            <i class="bi bi-plus-circle"></i>
            <span>Add New</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { addCategoryOption, updateCategoryOption } from '@/firebase'
import type { CategoryOption, CategorySubcategory } from '@/types/category'

interface Subcategory {
  id: string
  label: string
}

interface Category {
  id: string
  label: string
  subcategories?: Subcategory[]
}

interface Props {
  isVisible: boolean
  selectedCategory?: string
  selectedSubcategory?: string
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'select', category: Category, subcategory?: Subcategory): void
  (e: 'refresh'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive state
const showingSubcategories = ref(false)
const selectedParentCategory = ref<Category | null>(null)
const showAddCategoryForm = ref(false)
const showAddSubcategoryForm = ref(false)
const isManageMode = ref(false)
const isLoading = ref(false)
const categoryError = ref('')
const subcategoryError = ref('')

// Form data
const newCategory = reactive({
  label: '',
  id: ''
})

const newSubcategory = reactive({
  label: '',
  id: ''
})

const closeModal = () => {
  resetForms()
  showingSubcategories.value = false
  selectedParentCategory.value = null
  showAddCategoryForm.value = false
  showAddSubcategoryForm.value = false
  isManageMode.value = false
  emit('close')
}

const resetForms = () => {
  newCategory.label = ''
  newCategory.id = ''
  newSubcategory.label = ''
  newSubcategory.id = ''
  categoryError.value = ''
  subcategoryError.value = ''
  isLoading.value = false
}

const getModalTitle = () => {
  if (showAddCategoryForm.value) return 'Add New Category'
  if (showAddSubcategoryForm.value) return `Add Subcategory to ${selectedParentCategory.value?.label}`
  if (showingSubcategories.value) return selectedParentCategory.value?.label || 'Category'
  return 'Category'
}

const goBack = () => {
  if (showAddCategoryForm.value) {
    showAddCategoryForm.value = false
  } else if (showAddSubcategoryForm.value) {
    showAddSubcategoryForm.value = false
  } else if (showingSubcategories.value) {
    showingSubcategories.value = false
    selectedParentCategory.value = null
  }
  resetForms()
}

const handleCategoryClick = (category: Category) => {
  if (category.subcategories && category.subcategories.length > 0) {
    // Show subcategories
    selectedParentCategory.value = category
    showingSubcategories.value = true
  } else {
    // Select category directly
    emit('select', category)
    closeModal()
  }
}



const selectParentOnly = () => {
  if (selectedParentCategory.value) {
    emit('select', selectedParentCategory.value)
    closeModal()
  }
}

const selectSubcategory = (subcategory: Subcategory) => {
  if (selectedParentCategory.value) {
    emit('select', selectedParentCategory.value, subcategory)
    closeModal()
  }
}

// Function to add subcategory to an existing category
const addSubcategoryToCategory = (category: Category) => {
  selectedParentCategory.value = category
  showAddSubcategoryForm.value = true
}

// View category subcategories (for manage mode)
const viewCategorySubcategories = (category: Category) => {
  selectedParentCategory.value = category
  showingSubcategories.value = true
}

// Get tooltip text for categories
const getCategoryTooltip = (category: Category) => {
  if (category.subcategories && category.subcategories.length > 0) {
    return `Click to view ${category.subcategories.length} subcategories`
  } else {
    return `Click to select • Double-click to add subcategory`
  }
}

// Category management functions
const generateId = (label: string): string => {
  return label.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const validateCategoryName = (name: string): boolean => {
  categoryError.value = ''

  if (!name.trim()) {
    categoryError.value = 'Category name is required'
    return false
  }

  if (name.length > 50) {
    categoryError.value = 'Category name must be 50 characters or less'
    return false
  }

  return true
}

const validateSubcategoryName = (name: string): boolean => {
  subcategoryError.value = ''

  if (!name.trim()) {
    subcategoryError.value = 'Subcategory name is required'
    return false
  }

  if (name.length > 50) {
    subcategoryError.value = 'Subcategory name must be 50 characters or less'
    return false
  }

  if (selectedParentCategory.value?.subcategories?.some(sub =>
    sub.label.toLowerCase() === name.trim().toLowerCase()
  )) {
    subcategoryError.value = 'This subcategory already exists'
    return false
  }

  return true
}

const saveNewCategory = async () => {
  if (!validateCategoryName(newCategory.label)) return

  const categoryId = generateId(newCategory.label)

  try {
    isLoading.value = true

    const categoryOption: CategoryOption = {
      id: categoryId,
      label: newCategory.label.trim(),
      subcategories: []
    }

    await addCategoryOption(categoryOption)
    emit('refresh')

    // Select the newly created category
    emit('select', categoryOption)
    closeModal()
  } catch (error) {
    console.error('Error adding category:', error)
    categoryError.value = 'Failed to add category. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const saveNewSubcategory = async () => {
  if (!validateSubcategoryName(newSubcategory.label) || !selectedParentCategory.value) return

  const subcategoryId = generateId(newSubcategory.label)

  try {
    isLoading.value = true

    const newSub: CategorySubcategory = {
      id: subcategoryId,
      label: newSubcategory.label.trim()
    }

    const updatedSubcategories = [
      ...(selectedParentCategory.value.subcategories || []),
      newSub
    ]

    await updateCategoryOption(selectedParentCategory.value.id, {
      subcategories: updatedSubcategories
    })

    emit('refresh')

    // Select the newly created subcategory
    emit('select', selectedParentCategory.value, newSub)
    closeModal()
  } catch (error) {
    console.error('Error adding subcategory:', error)
    subcategoryError.value = 'Failed to add subcategory. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const cancelAddCategory = () => {
  showAddCategoryForm.value = false
  resetForms()
}

const cancelAddSubcategory = () => {
  showAddSubcategoryForm.value = false
  resetForms()
}
</script>

<style scoped>
.category-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1050;
}

.category-modal {
  width: 100%;
  background-color: white;
  border-radius: 1rem 1rem 0 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.back-btn:hover {
  background-color: #f8f9fa;
  color: #dc3545;
}

.modal-title {
  margin: 0;
  font-weight: 600;
  color: #212529;
  flex: 1;
  text-align: center;
}

.mode-toggle {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: transparent;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background-color: #dc3545;
  color: white;
}

.mode-btn:hover:not(.active) {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.close-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 1.5rem;
}

.category-btn {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background-color: white;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  gap: 0.25rem;
}

.category-btn.can-add-subcategory {
  border-style: dashed;
  border-color: #dc3545;
}

.category-btn.can-add-subcategory:hover {
  background-color: rgba(220, 53, 69, 0.05);
  border-color: #dc3545;
  color: #dc3545;
}

.add-subcategory-hint {
  font-size: 0.65rem;
  opacity: 0.6;
  font-weight: 400;
  color: #dc3545;
  margin-top: 0.25rem;
}

/* Manage Mode Styles */
.category-manage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background-color: white;
  transition: all 0.2s ease;
}

.category-manage-item:hover {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.02);
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-name {
  font-weight: 500;
  color: #212529;
  font-size: 0.875rem;
}

.subcategory-count {
  font-size: 0.75rem;
  color: #28a745;
  font-weight: 400;
}

.no-subcategories {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 400;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  background-color: white;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

.view-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.05);
}

.add-sub-btn:hover {
  border-color: #28a745;
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.05);
}

.category-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.05);
}

.category-btn.active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.category-btn.has-subcategories {
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 0.75rem;
  gap: 0;
}

.category-btn.has-subcategories .subcategory-arrow {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  opacity: 0.7;
}

.category-btn.parent-option {
  flex-direction: column;
  gap: 0.25rem;
}

.parent-label {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: 400;
}

.add-new-btn {
  background-color: #f8f9fa !important;
  border: 2px dashed #dc3545 !important;
  color: #dc3545 !important;
  flex-direction: column;
  gap: 0.25rem;
}

.add-new-btn:hover {
  background-color: rgba(220, 53, 69, 0.1) !important;
  border-color: #dc3545 !important;
}

.add-new-btn i {
  font-size: 1.25rem;
}

.add-new-btn span {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Form Styles */
.add-category-form,
.add-subcategory-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  outline: 0;
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #dc3545;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #c82333;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.125rem solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.125rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Mobile adjustments */
@media (max-width: 576px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }

  .category-btn {
    padding: 0.75rem;
    font-size: 0.8rem;
    min-height: 50px;
  }

  .add-category-form,
  .add-subcategory-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
