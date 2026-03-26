<template>
  <div class="page-shell">
    <section class="section-panel">
      <div class="section-head">
        <div class="section-head__main">
          <div class="section-title__eyebrow">{{ searchKeyword ? "Search" : "Home" }}</div>
          <h2 class="section-title">{{ searchKeyword ? `搜索 ${searchKeyword}` : "首页" }}</h2>
        </div>

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

      <div class="page-head-metrics">
        <span class="page-head-metric">内容 {{ store.state.posts.length }}</span>
        <span class="page-head-metric">活动 {{ store.state.activities.length }}</span>
        <span class="page-head-metric">可选活动 {{ store.selectableActivities.value.length }}</span>
        <span class="page-head-metric">消息 {{ store.state.unreadCount }}</span>
      </div>

      <div v-if="announcement" class="notice-strip">
        {{ announcement.title }}
      </div>
    </section>

    <section v-if="featuredActivity || announcement" class="featured-grid">
      <article v-if="announcement" class="hero-card hero-card--notice">
        <div class="hero-card__eyebrow">{{ announcement.badge || "公告" }}</div>
        <h2 class="hero-card__title">{{ announcement.title }}</h2>
        <p class="hero-card__copy">{{ announcement.summary }}</p>
        <div class="hero-card__meta">{{ announcement.publishTime || "刚刚更新" }}</div>
      </article>

      <article
        v-if="featuredActivity"
        class="hero-card hero-card--activity"
        @click="openActivity(featuredActivity.id)"
      >
        <div class="hero-card__eyebrow">{{ featuredActivity.badge }}</div>
        <h2 class="hero-card__title">{{ featuredActivity.title }}</h2>
        <p class="hero-card__copy">{{ featuredActivity.summary }}</p>
        <div class="hero-card__meta">{{ featuredActivity.period }}</div>
      </article>
    </section>

    <section class="section-panel">
      <div class="section-head">
        <div class="section-head__main">
          <div class="section-title__eyebrow">{{ searchKeyword ? "Result" : "Feed" }}</div>
          <h2 class="section-title">{{ searchKeyword ? "搜索结果" : "内容流" }}</h2>
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
              : "接口已连接，但这一栏暂时为空。" }}
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

function openActivity(id) {
  router.push({ name: "activity-detail", params: { id } });
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
