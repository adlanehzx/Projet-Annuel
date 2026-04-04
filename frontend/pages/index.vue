<template>
  <main class="bg-slate-900 text-white min-h-screen">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-4">🎬 CineTrack</h1>
        <p class="text-2xl text-slate-400 mb-8">
          Votre application de suivi cinématographique style Letterboxd
        </p>
        <div
          v-if="!auth.isAuthenticated.value"
          class="flex gap-4 justify-center mb-12"
        >
          <NuxtLink
            to="/auth/register"
            class="bg-amber-500 hover:bg-amber-600 px-8 py-3 rounded-lg font-semibold transition text-lg"
          >
            Créer un compte
          </NuxtLink>
          <NuxtLink
            to="/auth/login"
            class="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-lg font-semibold transition text-lg"
          >
            Se connecter
          </NuxtLink>
        </div>
        <div v-else class="flex gap-4 justify-center">
          <NuxtLink
            to="/watchlist"
            class="bg-amber-500 hover:bg-amber-600 px-8 py-3 rounded-lg font-semibold transition text-lg"
          >
            Ma Watchlist
          </NuxtLink>
          <NuxtLink
            to="/movies/search"
            class="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-lg font-semibold transition text-lg"
          >
            Découvrir des films
          </NuxtLink>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="text-xl font-bold mb-2">Rechercher</h3>
          <p class="text-slate-400">
            Explorez des millions de films via l'API TMDB
          </p>
        </div>

        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div class="text-4xl mb-3">📋</div>
          <h3 class="text-xl font-bold mb-2">Watchlist</h3>
          <p class="text-slate-400">Organisez avec À voir, En cours, Terminé</p>
        </div>

        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div class="text-4xl mb-3">⭐</div>
          <h3 class="text-xl font-bold mb-2">Noter & Commenter</h3>
          <p class="text-slate-400">
            Notez vos films 0-10 et partagez vos avis
          </p>
        </div>

        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div class="text-4xl mb-3">📚</div>
          <h3 class="text-xl font-bold mb-2">Collections</h3>
          <p class="text-slate-400">
            Créez des listes thématiques personnalisées
          </p>
        </div>
      </div>

      <!-- Info Section -->
      <div
        v-if="!auth.isAuthenticated.value"
        class="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center"
      >
        <h2 class="text-3xl font-bold mb-4">Comment ça marche ?</h2>
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <div class="text-3xl font-bold text-amber-500 mb-2">1</div>
            <h3 class="font-bold mb-2">Créer un compte</h3>
            <p class="text-slate-400">
              Inscrivez-vous gratuitement en quelques secondes
            </p>
          </div>
          <div>
            <div class="text-3xl font-bold text-amber-500 mb-2">2</div>
            <h3 class="font-bold mb-2">Chercher des films</h3>
            <p class="text-slate-400">
              Parcourez la base de données complète de TMDB
            </p>
          </div>
          <div>
            <div class="text-3xl font-bold text-amber-500 mb-2">3</div>
            <h3 class="font-bold mb-2">Organiser & Noter</h3>
            <p class="text-slate-400">
              Gérez votre watchlist et notez vos favoris
            </p>
          </div>
        </div>

        <NuxtLink
          to="/auth/register"
          class="bg-amber-500 hover:bg-amber-600 px-8 py-3 rounded-lg font-semibold transition text-lg inline-block"
        >
          Commencer maintenant →
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const auth = useAuth();
</script>
