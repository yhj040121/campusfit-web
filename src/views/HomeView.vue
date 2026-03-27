<template>
  <div class="page-shell">
    <section class="featured-grid">
      <article
        class="hero-card hero-card--notice hero-card--portal"
        role="button"
        tabindex="0"
        @click="openAnnouncements"
        @keydown.enter.prevent="openAnnouncements"
        @keydown.space.prevent="openAnnouncements"
      >
        <div class="hero-card__eyebrow">{{ announcement?.badge || "公告" }}</div>
        <h2 class="hero-card__title">{{ announcement?.title || "官方公告" }}</h2>
        <p class="hero-card__copy">
          {{ announcement?.summary || "这里会显示最新公告。点击后可以查看全部历史公告。" }}
        </p>
        <div class="hero-card__meta">{{ announcementMeta }}</div>
        <div class="hero-card__action">查看历史公告</div>
      </article>

      <article
        class="hero-card hero-card--activity hero-card--portal"
        role="button"
        tabindex="0"
        @click="openActivities"
        @keydown.enter.prevent="openActivities"
        @keydown.space.prevent="openActivities"
      >
        <div class="hero-card__eyebrow">{{ featuredActivity?.badge || "活动" }}</div>
        <h2 class="hero-card__title">{{ featuredActivity?.title || "活动中心" }}</h2>
        <p class="hero-card__copy">
          {{ featuredActivity?.summary || "点击进入活动中心，查看所有活动，并可继续进入单个活动详情。" }}
        </p>
        <div class="hero-card__meta">{{ activityMeta }}</div>
        <div class="hero-card__action">查看所有活动</div>
      </article>
    </section>

    <section class="section-panel">
      <div class="section-head">
        <div class="section-head__main">
          <div class="section-title__eyebrow">{{ searchKeyword ? "Result" : "Feed" }}</div>
          <h2 class="section-title">{{ searchKeyword ? "搜索结果" : "内容流" }}</h2>
        </div>

        <div class="feed-head__controls">
          <div class="filter-row">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['filter-chip', !searchKeyword && activeTab === tab.id ? 'filter-chip--active' : '']"
              type="button"
              :disabled="!!searchKeyword"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <button
            v-if="searchKeyword"
            class="ghost-button ghost-button--compact"
            type="button"
            @click="clearSearch"
          >
            清除搜索
          </button>
        </div>
      </div>

      <div v-if="searchLoading" class="feed-grid">
        <div v-for="index in 3" :key="index" class="skeleton skeleton-card"></div>
      </div>

      <div v-else-if="feedPosts.length" :class="['feed-grid', feedPosts.length === 1 ? 'feed-grid--single' : '']">
        <PostCard
          v-for="post in feedPosts"
          :key="post.id"
          :post="post"
          @open="openPost"
        />
      </div>

      <div v-else class="empty-state">
        <div class="empty-state__title">当前没有内容</div>
        <p class="empty-state__copy">
          {{ searchKeyword
            ? "没有匹配结果。"
            : activeTab === 'following'
              ? "你还没有关注作者。"
              : "接口已经连接成功，但这一栏暂时为空。" }}
        </p>
        <button class="primary-button empty-state__action" type="button" @click="handleEmptyAction">
          {{ searchKeyword ? "返回首页" : "去活动中心" }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAppStore } from "../stores/appStore";

const router = useRouter();
const route = useRoute();
const store = useAppStore();

const tabs = [
  { id: "recommend", label: "推荐" },
  { id: "following", label: "关注" },
  { id: "hot", label: "热门" }
];

const activeTab = ref("recommend");
const searchLoading = ref(false);
const searchPosts = ref([]);

const searchKeyword = computed(() => {
  if (Array.isArray(route.query.q)) {
    return String(route.query.q[0] || "").trim();
  }
  return String(route.query.q || "").trim();
});

const announcement = computed(() => store.state.announcement);
const featuredActivity = computed(() => store.state.featuredActivities[0] || store.state.activities[0] || null);

const announcementMeta = computed(() => {
  return announcement.value?.publishTime || "查看历史公告";
});

const activityMeta = computed(() => {
  if (featuredActivity.value?.period) {
    return featuredActivity.value.period;
  }
  if (store.state.activities.length) {
    return `当前共 ${store.state.activities.length} 个活动`;
  }
  return "查看所有活动";
});

const followingPosts = computed(() => {
  return store.state.posts.filter((item) => store.followedAuthorIds.value.includes(String(item.authorId)));
});

const hotPosts = computed(() => {
  return [...store.state.posts].sort((left, right) => {
    const leftHeat = left.likes + left.comments * 2 + left.saves * 2;
    const rightHeat = right.likes + right.comments * 2 + right.saves * 2;
    return rightHeat - leftHeat;
  });
});

const feedPosts = computed(() => {
  if (searchKeyword.value) {
    return searchPosts.value;
  }
  if (activeTab.value === "following") {
    return followingPosts.value;
  }
  if (activeTab.value === "hot") {
    return hotPosts.value;
  }
  return store.state.posts;
});

watch(
  searchKeyword,
  async (keyword) => {
    if (!keyword) {
      searchPosts.value = [];
      return;
    }

    searchLoading.value = true;
    try {
      const result = await api.searchPosts(keyword);
      searchPosts.value = result.map((item, index) => store.normalizePost(item, index));
    } catch (error) {
      searchPosts.value = [];
    } finally {
      searchLoading.value = false;
    }
  },
  { immediate: true }
);

function openPost(id) {
  router.push({ name: "post-detail", params: { id } });
}

function openAnnouncements() {
  const query = announcement.value?.id ? { id: announcement.value.id } : {};
  router.push({ name: "announcements", query });
}

function openActivities() {
  router.push({ name: "activities" });
}

function clearSearch() {
  router.push({ name: "home" });
}

function handleEmptyAction() {
  if (searchKeyword.value) {
    clearSearch();
    return;
  }
  router.push({ name: "activities" });
}
</script>

<style scoped>
.feed-head__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.featured-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hero-card--portal {
  display: grid;
  gap: 16px;
  align-content: start;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), filter var(--transition);
}

.hero-card--portal:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  filter: saturate(1.03);
}

.hero-card--portal:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.48);
  outline-offset: 4px;
}

.hero-card__title,
.hero-card__copy,
.hero-card__meta,
.hero-card__action {
  position: relative;
  z-index: 1;
}

.hero-card__action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  min-height: 42px;
  margin-top: auto;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.hero-card__action::after {
  content: "→";
  font-size: 14px;
  line-height: 1;
}

@media (max-width: 720px) {
  .feed-head__controls {
    width: 100%;
    justify-content: flex-start;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
