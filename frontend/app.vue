<template>
  <div :class="isDark ? 'dark' : ''" style="min-height:100vh;background:var(--bg);color:var(--text-primary);font-family:var(--font-body)">

    <template v-if="!auth.isAuthenticated.value">
      <header v-if="!isMobile" :style="landingHeaderVars" style="background:var(--bg-elevated);color:var(--text-primary);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;height:64px;position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border)">
        <NuxtLink to="/" style="display:flex;align-items:center;gap:10px;text-decoration:none">
          <BrandSeal :size="30" format="svg" style="flex-shrink:0;transform:rotate(6deg)" loading="eager" />
          <span style="font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--text-primary)">HankoTrack</span>
        </NuxtLink>
        <span style="flex:1"></span>
        <NuxtLink to="/animes" class="at-link" style="padding:0">Catalogue</NuxtLink>
        <NuxtLink to="/auth/login" class="at-link" style="font-weight:500;color:var(--text-primary);padding:8px 6px;white-space:nowrap">Connexion</NuxtLink>
        <NuxtLink to="/auth/register" class="at-btn-primary" style="padding:9px 18px;font-weight:500;text-decoration:none;white-space:nowrap;display:inline-flex;align-items:center">Commencer</NuxtLink>
        <button @click="toggleDark" aria-label="Basculer thème" class="at-icon-btn" style="font-size:15px">{{ isDark ? '☀️' : '🌙' }}</button>
      </header>
      <header v-else :style="landingHeaderVars" class="guest-header-mobile" style="height:56px;background:var(--bg-elevated);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:0 12px;position:sticky;top:0;z-index:50">
        <NuxtLink to="/" style="display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0">
          <BrandSeal :size="24" format="svg" style="flex-shrink:0;transform:rotate(6deg)" loading="eager" />
          <span style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">HankoTrack</span>
        </NuxtLink>
        <span style="flex:1"></span>
        <NuxtLink to="/animes" class="at-link" style="font-size:13px;padding:8px 6px;white-space:nowrap">Catalogue</NuxtLink>
        <NuxtLink to="/auth/login" class="at-link" style="font-size:13px;font-weight:500;color:var(--text-primary);padding:8px 6px;white-space:nowrap">Connexion</NuxtLink>
        <button @click="toggleDark" aria-label="Basculer thème" class="at-icon-btn" style="width:36px;height:36px;font-size:14px">{{ isDark ? '☀️' : '🌙' }}</button>
      </header>
      <NuxtPage />
    </template>

    <div v-else-if="!isMobile" style="display:flex;min-height:100vh">
      <aside :style="`width:${collapsed ? '72px' : '238px'};flex-shrink:0;background:var(--bg-elevated);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:${collapsed ? '22px 12px' : '22px 16px'};gap:18px;overflow-y:auto;overflow-x:hidden;transition:width 180ms ease-out;height:100vh;position:sticky;top:0;z-index:40`">
        <div :style="`display:flex;align-items:center;justify-content:${collapsed ? 'center' : 'space-between'};gap:8px;flex-wrap:${collapsed ? 'wrap' : 'nowrap'}`">
          <NuxtLink to="/animes" aria-label="HankoTrack — catalogue" style="display:flex;align-items:center;gap:10px;text-decoration:none;padding:0 4px">
            <BrandSeal :size="30" format="svg" style="flex-shrink:0;transform:rotate(6deg)" loading="eager" />
            <span v-if="!collapsed" style="font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--text-primary)">HankoTrack</span>
          </NuxtLink>
          <button @click="toggleSide" class="at-icon-btn" :aria-label="collapsed ? 'Déplier le menu' : 'Replier le menu'" :title="collapsed ? 'Déplier le menu' : 'Replier le menu'" style="width:26px;height:26px;border-radius:6px;border:none;background:transparent">
            <AppIcon :name="collapsed ? 'expand' : 'collapse'" :size="16" />
          </button>
        </div>

        <div v-for="group in navGroups" :key="group.title">
          <div v-if="!collapsed" style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:var(--text-secondary);padding:0 10px;margin-bottom:8px">{{ group.title }}</div>
          <div style="display:flex;flex-direction:column;gap:2px">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :title="item.label"
              :aria-current="isActive(item) ? 'page' : undefined"
              class="at-nav-item"
              :class="{ 'is-active': isActive(item) }"
              :style="`justify-content:${collapsed ? 'center' : 'flex-start'}`"
            >
              <AppIcon :name="item.icon" :size="18" style="flex-shrink:0" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>

        <span style="flex:1"></span>

        <div :style="`display:flex;align-items:center;justify-content:${collapsed ? 'center' : 'flex-start'};gap:10px;padding-top:16px;border-top:1px solid var(--border);flex-wrap:${collapsed ? 'wrap' : 'nowrap'}`">
          <div style="width:36px;height:36px;border-radius:999px;background:var(--color-accent-secondary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:12px;flex-shrink:0">{{ initials }}</div>
          <div v-if="!collapsed" style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ auth.user.value?.username }}</div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">Membre</div>
          </div>
          <button @click="toggleDark" aria-label="Basculer thème" class="at-icon-btn" style="width:34px;height:34px;font-size:15px">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>

        <button @click="handleLogout" title="Déconnexion" class="at-nav-item" :style="`justify-content:${collapsed ? 'center' : 'flex-start'}`">
          <AppIcon name="logout" :size="18" style="flex-shrink:0" />
          <span v-if="!collapsed">Déconnexion</span>
        </button>
      </aside>

      <main class="at-main" style="flex:1;min-width:0">
        <NuxtPage />
      </main>
    </div>

    <div v-else class="at-shell-mobile" style="display:flex;flex-direction:column;min-height:100vh">
      <header style="height:56px;background:var(--bg-elevated);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;padding:0 12px;position:sticky;top:0;z-index:50">
        <NuxtLink to="/animes" style="display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0">
          <BrandSeal :size="24" format="svg" style="flex-shrink:0;transform:rotate(6deg)" loading="eager" />
          <span style="font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">HankoTrack</span>
        </NuxtLink>
        <span style="flex:1"></span>
        <button @click="toggleDark" aria-label="Basculer thème" class="at-icon-btn" style="width:40px;height:40px;font-size:15px">{{ isDark ? '☀️' : '🌙' }}</button>
        <div style="position:relative">
          <button @click="avatarOpen = !avatarOpen" aria-label="Menu du compte" style="width:40px;height:40px;border-radius:999px;border:none;background:var(--color-accent-secondary);color:#fff;font-family:var(--font-display);font-weight:700;font-size:12px;cursor:pointer;transition:filter var(--at-duration) ease, transform var(--at-duration) var(--at-ease)" class="at-avatar-trigger">{{ initials }}</button>
          <Transition name="at-panel">
            <div v-if="avatarOpen" class="at-panel" style="position:absolute;right:0;top:46px;min-width:180px;padding:6px;z-index:80">
              <NuxtLink to="/profile" @click="avatarOpen=false" class="at-menu-item">Profil</NuxtLink>
              <div style="height:1px;background:var(--border);margin:6px 8px"></div>
              <button @click="handleLogout" class="at-menu-item is-danger">D&#233;connexion</button>
            </div>
          </Transition>
        </div>
      </header>

      <main class="at-main at-main-mobile" style="flex:1;min-width:0">
        <NuxtPage />
      </main>

      <nav class="at-mobile-tabs" style="height:60px;background:var(--bg-elevated);border-top:1px solid var(--border);display:flex;position:sticky;bottom:0;z-index:50;padding-bottom:env(safe-area-inset-bottom, 0)">
        <NuxtLink
          v-for="tab in mobileTabs"
          :key="tab.to"
          :to="tab.to"
          class="at-tab"
          :class="{ 'is-active': route.path.startsWith(tab.to) }"
        >{{ tab.label }}</NuxtLink>
      </nav>
    </div>

    <CookieConsentBanner />

    <AuthPromptModal />
  </div>
</template>

<script setup lang="ts">
declare const useAuth: any;
declare const useRoute: any;
declare const useSidebar: any;
declare const ref: any;
declare const computed: any;
declare const watch: any;
declare const onMounted: any;
declare const onBeforeUnmount: any;
declare const navigateTo: any;
declare const process: any;

const auth = useAuth();
const route = useRoute();
const { collapsed, init: initSidebar, toggle: toggleSide } = useSidebar();
const isDark = ref(true);
const avatarOpen = ref(false);
const isMobile = ref(false);

const toggleDark = () => {
  isDark.value = !isDark.value;
  if (process.client) localStorage.setItem("at-theme", isDark.value ? "dark" : "light");
};

const updateMobile = () => {
  if (process.client) isMobile.value = window.innerWidth < 1024;
};

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem("at-theme");
    isDark.value = saved !== null ? saved === "dark" : true;
  }
  initSidebar();
  updateMobile();
  if (process.client) window.addEventListener("resize", updateMobile);
});

onBeforeUnmount(() => {
  if (process.client) window.removeEventListener("resize", updateMobile);
});

watch(() => route.path, () => { avatarOpen.value = false; });

const landingHeaderVars = computed(() =>
  route.path === "/"
    ? "--bg-elevated:#14171F;--text-primary:#F1F0EC;--text-secondary:#C9CAD1;--text-tertiary:#9C9AA6;--bg-input:rgba(255,255,255,0.08);--border:rgba(255,255,255,0.18);"
    : "",
);

type NavItem = { label: string; icon: string; to: string; exact?: boolean };

const navGroups = computed(() => [
  {
    title: "MENU",
    items: [{ label: "Catalogue", icon: "grid", to: "/animes" }],
  },
  {
    title: "BIBLIOTHÈQUE",
    items: [
      { label: "Ma Watchlist", icon: "bookmark", to: "/watchlist" },
      { label: "Mes Listes", icon: "list", to: "/lists" },
      { label: "Recommandations", icon: "sparkles", to: "/recommendations" },
    ],
  },
  {
    title: "GÉNÉRAL",
    items: [{ label: "Profil", icon: "user", to: "/profile" }],
  },
] as { title: string; items: NavItem[] }[]);

const isActive = (item: NavItem) =>
  item.exact ? route.path === item.to : route.path.startsWith(item.to);

const mobileTabs = computed(() => [
  { label: "Catalogue", to: "/animes" },
  { label: "Watchlist", to: "/watchlist" },
  { label: "Listes", to: "/lists" },
  { label: "Profil", to: "/profile" },
]);

const initials = computed(() => (auth.user.value?.username || "??").slice(0, 2).toUpperCase());

const handleLogout = () => { avatarOpen.value = false; auth.logout(); navigateTo("/"); };
</script>

<style scoped>
.at-avatar-trigger:hover { filter: brightness(1.08); }
.at-avatar-trigger:active { transform: scale(0.96); }
.at-main-mobile {
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}
</style>
