<template>
  <div class="tab-nav">
    <ul class="nav nav-tabs border-0">
      <li class="nav-item" v-for="tab in tabs" :key="tab.name">
        <a
          class="nav-link"
          :class="{ active: activeTab === tab.name }"
          @click="$emit('update:activeTab', tab.name)"
          href="#"
        >
          {{ tab.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ tabs: Array<{ name: string, label: string }>, activeTab: string }>()
</script>
