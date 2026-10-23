<template>
  <div class="tab-nav">
    <ul class="nav nav-tabs border-0">
      <li class="nav-item" v-for="tab in tabs" :key="tab.name">
        <a
          class="nav-link"
          :class="{ active: activeTab === tab.name }"
          @click.prevent="emit('update:activeTab', tab.name)"
          href="#"
        >
          {{ tab.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{ tabs: Array<{ name: string, label: string }>, activeTab: string }>()
const emit = defineEmits<{ 'update:activeTab': [name: string] }>()
</script>

<style scoped>
.tab-nav {
  background-color: #ffffff;
  border-bottom: 1px solid #edf2f7;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-nav::-webkit-scrollbar {
  display: none;
}

.nav-tabs {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: none;
  padding: 0 0.5rem;
}

.nav-link {
  border: none !important;
  border-radius: 0 !important;
  color: #8e8e93 !important;
  padding: 0.65rem 0.85rem !important;
  font-size: 0.92rem;
  font-weight: 500;
  border-bottom: 2.5px solid transparent !important;
  background-color: transparent !important;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.nav-link.active {
  color: #1a1a1a !important;
  border-bottom-color: #ea5455 !important;
  font-weight: 600;
}

.nav-link:hover:not(.active) {
  color: #495057 !important;
}
</style>
