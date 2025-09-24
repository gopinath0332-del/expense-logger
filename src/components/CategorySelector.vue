<template>
  <!-- Category Selector Modal -->
  <div v-if="isVisible" class="category-modal-overlay" @click="closeModal">
    <div class="category-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h5 class="modal-title">Category</h5>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Category Grid -->
      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  label: string
}

interface Props {
  isVisible: boolean
  selectedCategory?: string
  categories: Category[]
}

interface Emits {
  (e: 'close'): void
  (e: 'select', category: Category): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const closeModal = () => {
  emit('close')
}

const selectCategory = (category: Category) => {
  emit('select', category)
  emit('close')
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
}

.modal-title {
  margin: 0;
  font-weight: 600;
  color: #212529;
}

.close-btn {
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
