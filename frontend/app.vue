<template>
  <div class="min-h-screen bg-dark text-white">
    <nav class="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div
        class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"
      >
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 font-bold text-xl text-primary"
        >
          🎬 CineTrack
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="hover:text-primary transition"
            >Accueil</NuxtLink
          >
          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/watchlist"
            class="hover:text-primary transition"
            >Ma Watchlist</NuxtLink
          >
          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/collections"
            class="hover:text-primary transition"
            >Collections</NuxtLink
          >
          <NuxtLink to="/movies" class="hover:text-primary transition"
            >Films</NuxtLink
          >
          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/movies/search"
            class="hover:text-primary transition"
            >Chercher</NuxtLink
          >

          <div
            v-if="auth.isAuthenticated.value"
            class="flex items-center space-x-4"
          >
            <NuxtLink to="/profile" class="hover:text-primary transition">
              {{ auth.user.value?.username }}
            </NuxtLink>
            <button
              @click="handleLogout"
              class="btn btn-secondary text-sm py-1 px-3"
            >
              Logout
            </button>
          </div>
          <div v-else class="flex items-center space-x-2">
            <NuxtLink
              to="/auth/login"
              class="btn btn-primary text-sm py-1 px-3"
            >
              Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="btn btn-secondary text-sm py-1 px-3"
            >
              Register
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();

const handleLogout = () => {
  auth.logout();
  navigateTo("/");
};
</script>
