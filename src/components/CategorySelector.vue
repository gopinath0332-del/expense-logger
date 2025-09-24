<template>
  <!-- Category Selector Modal -->
  <div v-if="isVisible" class="category-modal-overlay" @click="closeModal">
    <div class="category-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <button
          v-if="showingSubcategories"
          class="back-btn"
          @click="goBackToCategories"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <h5 class="modal-title">
          {{ showingSubcategories ? selectedParentCategory?.label : 'Category' }}
        </h5>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Categories or Subcategories Grid -->
      <div class="category-grid">
        <!-- Main Categories -->
        <template v-if="!showingSubcategories">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-btn"
            :class="{
              active: selectedCategory === category.id && !selectedSubcategory,
              'has-subcategories': category.subcategories && category.subcategories.length > 0
            }"
            @click="handleCategoryClick(category)"
          >
            {{ category.label }}
            <i v-if="category.subcategories && category.subcategories.length > 0"
               class="bi bi-chevron-right subcategory-arrow"></i>
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
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive state
const showingSubcategories = ref(false)
const selectedParentCategory = ref<Category | null>(null)

const closeModal = () => {
  showingSubcategories.value = false
  selectedParentCategory.value = null
  emit('close')
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

const goBackToCategories = () => {
  showingSubcategories.value = false
  selectedParentCategory.value = null
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
  align-items: center;
  justify-content: center;
  position: relative;
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
  justify-content: space-between;
  padding: 1rem 0.75rem;
}

.subcategory-arrow {
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
}
</style>
