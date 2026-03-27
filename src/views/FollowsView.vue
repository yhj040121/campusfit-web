<template>
  <div class="page-shell">
    <button class="ghost-button detail-shell__back" type="button" @click="router.push({ name: 'profile' })">返回我的</button>

    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后查看关注与粉丝</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
      </div>
    </section>

    <template v-else>
      <section class="section-panel">
        <div class="section-head">
          <div class="section-head__main">
            <div class="section-title__eyebrow">Follows</div>
            <h2 class="section-title">{{ currentType === "followers" ? "我的粉丝" : "我的关注" }}</h2>
          </div>

          <div class="preview-tabs">
            <button
              v-for="item in tabs"
              :key="item.id"
              :class="['preview-tab', currentType === item.id ? 'preview-tab--active' : '']"
              type="button"
              @click="selectType(item.id)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="page-head-metrics">
          <span class="page-head-metric">列表 {{ users.length }}</span>
          <span class="page-head-metric">{{ currentType === "followers" ? "粉丝" : "关注" }} {{ users.length }}</span>
        </div>
      </section>

      <section class="section-panel">
        <div v-if="loading && !users.length" class="list-stack">
          <div v-for="item in 3" :key="item" class="skeleton skeleton-card"></div>
        </div>

        <div v-else-if="users.length" class="follow-list">
          <article v-for="user in users" :key="user.id" class="follow-card">
            <div class="follow-card__avatar">
              <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name">
              <span v-else>{{ getInitial(user.name, user.avatar) }}</span>
            </div>

            <div class="follow-card__body">
              <div class="follow-card__head">
                <h3 class="follow-card__name">{{ user.name }}</h3>
                <div class="follow-card__actions">
                  <span class="follow-card__badge">{{ resolveBadgeText(user) }}</span>
                  <button
                    v-if="canToggleFollow(user)"
                    :class="['follow-card__button', user.active ? 'follow-card__button--soft' : 'follow-card__button--primary']"
                    type="button"
                    @click="toggleFollowAction(user)"
                  >
                    {{ user.active ? "取消关注" : "回关" }}
                  </button>
                </div>
              </div>
              <p class="follow-card__copy">{{ user.intro }}</p>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state__title">{{ currentType === "followers" ? "暂时还没有粉丝" : "你还没有关注任何人" }}</div>
          <p class="empty-state__copy">等内容互动起来后，这里就会逐步丰富。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import { useAppStore } from "../stores/appStore";
import { firstText, getInitial, safeText } from "../utils/formatters";

const router = useRouter();
const route = useRoute();
const store = useAppStore();

const tabs = [
  { id: "following", label: "关注" },
  { id: "followers", label: "粉丝" }
];

const loading = ref(false);
const users = ref([]);

const currentType = computed(() => {
  const type = String(route.query.type || "following");
  return type === "followers" ? "followers" : "following";
});
const requestType = computed(() => currentType.value === "followers" ? "fans" : "following");

watch(
  () => [store.isAuthed.value, currentType.value],
  async ([authed]) => {
    if (!authed) {
      users.value = [];
      return;
    }
    seedUsersFromStore();
    await loadUsers();
  },
  { immediate: true }
);

async function loadUsers() {
  loading.value = !users.value.length;
  try {
    const result = await api.listFollows(requestType.value);
    const normalized = (Array.isArray(result) ? result : []).map(normalizeUser);
    users.value = normalized;
    syncStoreUsers(normalized);
  } finally {
    loading.value = false;
  }
}

function normalizeUser(item, index = 0) {
  return {
    id: String(item?.userId || item?.id || `follow-${index}`),
    name: safeText(item?.name, "青搭用户"),
    avatar: safeText(item?.avatar, "青搭"),
    avatarUrl: firstText(item?.avatarUrl),
    intro: safeText(item?.intro, "这个用户还没有留下简介。"),
    active: !!item?.active
  };
}

function selectType(type) {
  router.replace({ name: "follows", query: { type } });
}

function resolveBadgeText(user) {
  if (currentType.value === "following") {
    return "已关注";
  }
  return user.active ? "互相关注" : "粉丝";
}

function canToggleFollow(user) {
  return currentType.value === "following" || currentType.value === "followers";
}

async function toggleFollowAction(user) {
  await api.toggleFollow(user.id);

  if (currentType.value === "following") {
    users.value = users.value.filter((item) => item.id !== user.id);
    store.state.follows = store.state.follows.filter((item) => String(item.userId || item.id) !== String(user.id));
    store.state.followers = store.state.followers.map((item) => {
      const itemId = String(item.userId || item.id || "");
      if (itemId !== String(user.id)) {
        return item;
      }
      return {
        ...item,
        active: false
      };
    });
    if (store.state.profile) {
      store.state.profile.following = Math.max(0, (store.state.profile.following || 0) - 1);
    }
    return;
  }

  users.value = users.value.map((item) => {
    if (item.id !== user.id) {
      return item;
    }
    return {
      ...item,
      active: !item.active
    };
  });

  store.state.followers = store.state.followers.map((item) => {
    const itemId = String(item.userId || item.id || "");
    if (itemId !== String(user.id)) {
      return item;
    }
    return {
      ...item,
      active: !item.active
    };
  });

  if (user.active) {
    store.state.follows = store.state.follows.filter((item) => String(item.userId || item.id) !== String(user.id));
  } else {
    store.state.follows = [
      ...store.state.follows.filter((item) => String(item.userId || item.id) !== String(user.id)),
      {
        userId: Number(user.id),
        name: user.name,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        intro: user.intro,
        active: true
      }
    ];
  }

  if (store.state.profile) {
    store.state.profile.following = Math.max(0, (store.state.profile.following || 0) + (user.active ? -1 : 1));
  }
}

function seedUsersFromStore() {
  const cached = currentType.value === "followers" ? store.state.followers : store.state.follows;
  users.value = (Array.isArray(cached) ? cached : []).map(normalizeUser);
}

function syncStoreUsers(list) {
  if (currentType.value === "followers") {
    store.state.followers = list;
    return;
  }
  store.state.follows = list;
}
</script>

<style scoped>
.follow-list {
  display: grid;
  gap: 14px;
}

.follow-card {
  display: flex;
  gap: 14px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}

.follow-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft) 55%, var(--accent));
}

.follow-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follow-card__body {
  min-width: 0;
  display: grid;
  gap: 8px;
  flex: 1 1 auto;
}

.follow-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.follow-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.follow-card__name {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.follow-card__badge {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(20, 103, 245, 0.08);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
}

.follow-card__copy {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

.follow-card__button {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.follow-card__button--primary {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.92), rgba(56, 194, 163, 0.88));
}

.follow-card__button--soft {
  color: var(--primary);
  background: rgba(20, 103, 245, 0.08);
}
</style>
