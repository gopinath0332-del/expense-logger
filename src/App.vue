<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-3">
      <div class="container">
        <RouterLink class="navbar-brand" to="/">Expense Logger</RouterLink>
        
        <div class="navbar-nav">
          <RouterLink class="nav-link" to="/">Home</RouterLink>
          <RouterLink class="nav-link" to="/dashboard">Dashboard</RouterLink>
          <RouterLink class="nav-link" to="/about">About</RouterLink>
        </div>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}

.nav-link.router-link-exact-active {
  color: #dc3545 !important;
  font-weight: bold;
}
</style>
