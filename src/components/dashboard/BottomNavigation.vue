<template>
  <div class="bottom-nav fixed-bottom bg-white border-top">
    <div class="d-flex justify-content-around p-2">
      <div
        v-for="item in navItems"
        :key="item.id"
        class="nav-item text-center"
        :class="{ 'active': item.active }"
        @click="handleNavClick(item)"
      >
        <i :class="item.icon" class="d-block"></i>
        <small :class="item.active ? 'text-danger' : 'text-muted'">{{ item.label }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavItem } from '@/types/transaction'

interface Props {
  navItems: NavItem[]
  onNavClick?: (item: NavItem) => void
}

const props = defineProps<Props>()

const handleNavClick = (item: NavItem) => {
  if (props.onNavClick) {
    props.onNavClick(item)
  }
}
</script>

<style scoped>
.bottom-nav {
  z-index: 999;
}

.nav-item {
  flex: 1;
  padding: 0.5rem;
  cursor: pointer;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.nav-item.active i {
  color: #dc3545;
}
</style>
