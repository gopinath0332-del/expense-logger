<template>
  <div class="fab-container">
    <button class="btn btn-danger rounded-circle fab" @click="handleClick">
      <i class="bi bi-plus fs-4"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  onClick?: () => void
}

const props = defineProps<Props>()

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
}

.fab {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: none;
}
</style>
