<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar__inner">
        <RouterLink class="brand" :to="{ name: 'home' }">
          <span class="brand__mark">QD</span>
          <span class="brand__text">
            <strong>青搭</strong>
          </span>
        </RouterLink>

        <nav class="page-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            :class="['nav-chip', route.name === item.name ? 'nav-chip--active' : '']"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="topbar__actions">
          <label class="search-field" for="globalSearchInput">
            <span class="search-field__icon">搜</span>
            <input
              id="globalSearchInput"
              v-model="searchText"
              type="search"
              placeholder="搜索内容或活动"
              @keydown.enter.prevent="submitSearch"
            >
          </label>
          <button
            class="ghost-button ghost-button--compact"
            type="button"
            :disabled="store.state.refreshing"
            @click="refreshAll"
          >
            {{ store.state.refreshing ? "刷新中..." : "刷新" }}
          </button>
          <button
            :class="[store.isAuthed.value ? 'ghost-button ghost-button--compact' : 'primary-button primary-button--compact']"
            type="button"
            @click="handleAuthClick"
          >
            {{ authText }}
          </button>
        </div>
      </div>
    </header>

    <main class="layout">
      <aside class="sidebar">
        <section class="panel panel--dense">
          <div class="status-metrics">
            <div class="status-metric">
              <strong>{{ store.state.posts.length }}</strong>
              <span>内容</span>
            </div>
            <div class="status-metric">
              <strong>{{ store.state.activities.length }}</strong>
              <span>活动</span>
            </div>
            <div class="status-metric">
              <strong>{{ store.selectableActivities.value.length }}</strong>
              <span>可选活动</span>
            </div>
            <div class="status-metric">
              <strong>{{ store.state.unreadCount }}</strong>
              <span>消息</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <template v-if="store.isAuthed.value && store.state.profile">
            <div class="quick-user">
              <div class="quick-user__avatar">
                <img v-if="store.state.profile.avatarUrl" :src="store.state.profile.avatarUrl" :alt="store.state.profile.name">
                <span v-else>{{ getInitial(store.state.profile.name, store.state.profile.avatar) }}</span>
              </div>
              <div class="quick-user__meta">
                <strong>{{ store.state.profile.name }}</strong>
                <span>{{ store.state.profile.school }}</span>
              </div>
            </div>

            <div class="quick-grid">
              <button class="quick-tile" type="button" @click="router.push({ name: 'publish' })">
                <span class="quick-tile__label">草稿</span>
                <span class="quick-tile__value">{{ store.state.drafts.length }}</span>
              </button>
              <button class="quick-tile" type="button" @click="router.push({ name: 'activities' })">
                <span class="quick-tile__label">活动</span>
                <span class="quick-tile__value">{{ store.state.myActivities.length }}</span>
              </button>
              <button class="quick-tile" type="button" @click="router.push({ name: 'profile' })">
                <span class="quick-tile__label">收藏</span>
                <span class="quick-tile__value">{{ store.state.favoritePosts.length }}</span>
              </button>
              <button class="quick-tile" type="button" @click="router.push({ name: 'profile' })">
                <span class="quick-tile__label">发布</span>
                <span class="quick-tile__value">{{ store.state.myPosts.length }}</span>
              </button>
            </div>

            <div class="quick-actions">
              <button class="quick-action" type="button" @click="router.push({ name: 'publish' })">发布内容</button>
              <button class="quick-action" type="button" @click="router.push({ name: 'profile' })">我的</button>
              <button class="quick-action" type="button" @click="handleLogout">退出登录</button>
            </div>
          </template>

          <template v-else>
            <div class="quick-actions quick-actions--tight">
              <button class="quick-action" type="button" @click="router.push({ name: 'home' })">首页</button>
              <button class="quick-action" type="button" @click="router.push({ name: 'activities' })">活动中心</button>
              <button class="quick-action" type="button" @click="store.openLoginDialog()">登录</button>
            </div>
          </template>
        </section>
      </aside>

      <section class="main-stage">
        <RouterView />
      </section>
    </main>

    <nav class="mobile-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        :class="['nav-chip', route.name === item.name ? 'nav-chip--active' : '']"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <LoginDialog
      :open="store.state.loginDialogOpen"
      :mode-value="store.state.loginForm.mode"
      :phone-value="store.state.loginForm.phone"
      :code-value="store.state.loginForm.code"
      :password-value="store.state.loginForm.password"
      :confirm-password-value="store.state.loginForm.confirmPassword"
      :nickname-value="store.state.loginForm.nickname"
      :sending="store.state.loginForm.sending"
      :submitting="store.state.loginForm.submitting"
      :countdown="store.state.loginForm.countdown"
      :error-text="store.state.loginForm.errorText"
      @close="store.closeLoginDialog()"
      @update:mode-value="handleModeChange"
      @update:phone-value="store.state.loginForm.phone = $event"
      @update:code-value="store.state.loginForm.code = $event"
      @update:password-value="store.state.loginForm.password = $event"
      @update:confirm-password-value="store.state.loginForm.confirmPassword = $event"
      @update:nickname-value="store.state.loginForm.nickname = $event"
      @send-code="handleSendCode"
      @submit="handleLogin"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import LoginDialog from "../components/LoginDialog.vue";
import { useAppStore } from "../stores/appStore";
import { firstText, getInitial } from "../utils/formatters";

const store = useAppStore();
const router = useRouter();
const route = useRoute();
const searchText = ref(firstText(route.query.q));

const navItems = [
  { name: "home", label: "首页" },
  { name: "activities", label: "活动" },
  { name: "publish", label: "发布" },
  { name: "profile", label: "我的" }
];

const authText = computed(() => {
  if (!store.isAuthed.value) {
    return "登录";
  }
  return firstText(store.state.profile?.name, store.state.user?.nickname, "我的");
});

watch(
  () => route.query.q,
  (value) => {
    searchText.value = firstText(value);
  }
);

onMounted(() => {
  store.bootstrap();
});

function submitSearch() {
  router.push({
    name: "home",
    query: searchText.value.trim() ? { q: searchText.value.trim() } : {}
  });
}

async function refreshAll() {
  await store.refreshAll();
}

function handleAuthClick() {
  if (store.isAuthed.value) {
    router.push({ name: "profile" });
    return;
  }
  store.openLoginDialog();
}

async function handleSendCode() {
  await store.sendLoginCode();
}

async function handleLogin() {
  await store.submitLoginForm();
}

function handleModeChange(mode) {
  store.state.loginForm.mode = mode;
  store.state.loginForm.errorText = "";
  if (mode !== "register") {
    store.state.loginForm.confirmPassword = "";
    store.state.loginForm.nickname = "";
  }
  if (mode === "password") {
    store.state.loginForm.code = "";
  }
  if (mode === "code") {
    store.state.loginForm.password = "";
    store.state.loginForm.confirmPassword = "";
  }
}

function handleLogout() {
  store.logout();
  router.push({ name: "home" });
}
</script>
