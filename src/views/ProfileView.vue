<template>
  <div class="page-shell">
    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后查看我的内容</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
      </div>
    </section>

    <template v-else>
      <div class="profile-columns">
        <div class="detail-stack">
          <section class="profile-hero">
            <div v-if="store.state.profile?.coverImageUrl" class="profile-hero__cover">
              <img :src="store.state.profile.coverImageUrl" :alt="store.state.profile.name">
            </div>
            <div class="profile-hero__overlay"></div>
            <div class="profile-hero__body">
              <div class="profile-avatar">
                <img v-if="store.state.profile?.avatarUrl" :src="store.state.profile.avatarUrl" :alt="store.state.profile.name">
                <span v-else>{{ getInitial(store.state.profile?.name, store.state.profile?.avatar) }}</span>
              </div>

              <div class="profile-identity">
                <h2>{{ store.state.profile?.name || "青搭用户" }}</h2>
                <div class="profile-meta-row">
                  <span>{{ store.state.profile?.school || "完善学校信息" }}</span>
                  <span v-if="store.state.profile?.locationName">{{ store.state.profile.locationName }}</span>
                  <span v-if="store.state.profile?.gender">{{ store.state.profile.gender }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="section-panel">
            <div class="metric-grid">
              <button class="metric-card metric-card--button" type="button" @click="router.push({ name: 'follows', query: { type: 'following' } })">
                <strong>{{ store.state.profile?.following || 0 }}</strong>
                <span>关注</span>
              </button>
              <button class="metric-card metric-card--button" type="button" @click="router.push({ name: 'follows', query: { type: 'followers' } })">
                <strong>{{ store.state.profile?.followers || 0 }}</strong>
                <span>粉丝</span>
              </button>
              <div class="metric-card">
                <strong>{{ store.state.profile?.likes || 0 }}</strong>
                <span>获赞</span>
              </div>
              <button class="metric-card metric-card--button" type="button" @click="router.push({ name: 'messages' })">
                <span v-if="store.state.unreadCount > 0" class="metric-card__badge">{{ store.state.unreadCount > 99 ? "99+" : store.state.unreadCount }}</span>
                <strong>{{ store.state.unreadCount || 0 }}</strong>
                <span>未读消息</span>
              </button>
            </div>
          </section>

          <section class="section-panel section-panel--library">
            <div class="section-head">
              <div class="section-head__main">
                <div class="section-title__eyebrow">Library</div>
                <h2 class="section-title">我的内容</h2>
              </div>

              <div class="preview-tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  :class="['preview-tab', activeTab === tab.id ? 'preview-tab--active' : '']"
                  type="button"
                  @click="selectTab(tab.id)"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <p v-if="activeTab === 'posts' && flashNotice" class="helper-inline">
              {{ flashNotice }} 待审核内容不会展示在首页信息流，审核通过后才会对外可见。
            </p>

            <div v-if="activeTab !== 'drafts' && currentPosts.length" class="library-grid">
              <PostCard
                v-for="post in currentPosts"
                :key="post.id"
                :post="post"
                :show-owner-actions="activeTab === 'posts'"
                compact
                @open="openPost"
                @edit="editPost"
                @remove="deletePostAction"
              />
            </div>

            <div v-else-if="activeTab === 'drafts' && store.state.drafts.length" class="library-grid">
              <article
                v-for="draft in store.state.drafts"
                :key="draft.id"
                class="draft-tile"
                @click="openDraft(draft.id)"
              >
                <div class="draft-tile__cover">
                  <img v-if="draft.coverUrl" :src="draft.coverUrl" :alt="draft.title">
                  <span class="media-pill">草稿</span>
                  <span class="media-label">{{ draft.savedAt }}</span>
                </div>

                <div class="draft-tile__body">
                  <div class="draft-tile__top">
                    <h3 class="draft-tile__title">{{ draft.title }}</h3>
                    <p class="draft-tile__copy">{{ draft.desc || "还没有填写描述" }}</p>
                  </div>

                  <div class="tag-row draft-tile__tags">
                    <span class="tag-pill">{{ draft.scene }}</span>
                    <span class="tag-pill">{{ draft.style }}</span>
                    <span class="tag-pill">{{ draft.budget || "预算未填" }}</span>
                  </div>

                  <div class="draft-tile__meta">
                    <span>{{ draft.savedAt }}</span>
                    <button class="small-link small-link--soft" type="button" @click.stop="openDraft(draft.id)">继续编辑</button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              <div class="empty-state__title">{{ emptyState.title }}</div>
              <p class="empty-state__copy">{{ emptyState.copy }}</p>
              <button
                v-if="emptyState.actionLabel"
                class="primary-button empty-state__action"
                type="button"
                @click="handleEmptyAction"
              >
                {{ emptyState.actionLabel }}
              </button>
            </div>
          </section>
        </div>

        <aside class="profile-side">
          <section class="panel">
            <div class="panel__eyebrow">Incentive</div>
            <h2 class="panel__title">激励中心</h2>
            <div class="status-metrics">
              <div class="status-metric">
                <strong>{{ store.state.incentiveCenter?.availableAmount || "¥0.00" }}</strong>
                <span>可提现</span>
              </div>
              <div class="status-metric">
                <strong>{{ store.state.incentiveCenter?.pendingSettlementAmount || "¥0.00" }}</strong>
                <span>待结算</span>
              </div>
            </div>
            <p v-if="store.state.incentiveCenter?.withdrawHint" class="helper-inline">{{ store.state.incentiveCenter.withdrawHint }}</p>
          </section>

          <section class="panel">
            <div class="panel__eyebrow">Activity</div>
            <h2 class="panel__title">我的活动</h2>

            <div v-if="store.state.myActivities.length" class="mini-activity-list">
              <article
                v-for="activity in store.state.myActivities.slice(0, 4)"
                :key="activity.id"
                class="mini-activity"
                @click="openActivity(activity.id)"
              >
                <h3 class="mini-activity__title">{{ activity.title }}</h3>
                <p class="mini-activity__copy">{{ activity.period }}</p>
              </article>
            </div>

            <div v-else class="comment-empty">暂无活动</div>

            <div class="quick-actions">
              <button class="quick-action" type="button" @click="router.push({ name: 'activities' })">活动中心</button>
              <button class="quick-action" type="button" @click="router.push({ name: 'publish' })">发布内容</button>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAppStore } from "../stores/appStore";
import { getInitial } from "../utils/formatters";

const router = useRouter();
const route = useRoute();
const store = useAppStore();

const tabs = [
  { id: "posts", label: "我的发布" },
  { id: "likes", label: "我的点赞" },
  { id: "favorites", label: "收藏" },
  { id: "drafts", label: "草稿" }
];
const validTabs = tabs.map((item) => item.id);

const activeTab = ref("posts");
const flashNotice = ref("");

onMounted(() => {
  syncTabFromRoute(route.query.tab);

  if (typeof window !== "undefined") {
    const flash =
      window.sessionStorage.getItem("campusfit_profile_notice")
      || window.sessionStorage.getItem("campusfit_publish_notice")
      || "";

    if (flash) {
      flashNotice.value = flash;
      window.sessionStorage.removeItem("campusfit_profile_notice");
      window.sessionStorage.removeItem("campusfit_publish_notice");
    }
  }
});

watch(
  () => route.query.tab,
  (value) => {
    syncTabFromRoute(value);
  }
);

const currentPosts = computed(() => {
  if (activeTab.value === "likes") {
    return store.state.likedPosts;
  }
  if (activeTab.value === "favorites") {
    return store.state.favoritePosts;
  }
  return store.state.myPosts;
});

const emptyState = computed(() => {
  if (activeTab.value === "likes") {
    return {
      title: "你还没有点赞过内容",
      copy: "看到喜欢的穿搭后点一下赞，内容就会收进这里。",
      actionLabel: "去首页看看",
      actionName: "home"
    };
  }

  if (activeTab.value === "favorites") {
    return {
      title: "你还没有收藏内容",
      copy: "先去内容流逛逛，遇到想反复参考的内容再收藏。",
      actionLabel: "去首页看看",
      actionName: "home"
    };
  }

  if (activeTab.value === "drafts") {
    return {
      title: "你还没有草稿",
      copy: "先起一个草稿，把灵感和图片存下来，之后再慢慢完善。",
      actionLabel: "去发布页",
      actionName: "publish"
    };
  }

  return {
    title: "这里还没有内容",
    copy: "发布第一条内容后，这里会开始积累你的作品。",
    actionLabel: "去发布",
    actionName: "publish"
  };
});

function openPost(id) {
  router.push({ name: "post-detail", params: { id } });
}

function openActivity(id) {
  router.push({ name: "activity-detail", params: { id } });
}

function openDraft(id) {
  router.push({ name: "publish", query: { draftId: id } });
}

function selectTab(tab) {
  activeTab.value = tab;

  const nextQuery = { ...route.query };
  if (tab === "posts") {
    delete nextQuery.tab;
  } else {
    nextQuery.tab = tab;
  }

  router.replace({ name: "profile", query: nextQuery });
}

function editPost(post) {
  router.push({ name: "publish", query: { postId: post.id } });
}

async function deletePostAction(post) {
  if (typeof window !== "undefined") {
    const confirmed = window.confirm(`确定删除《${post.title}》吗？删除后无法恢复。`);
    if (!confirmed) {
      return;
    }
  }

  try {
    await api.deletePost(post.id);
    flashNotice.value = "作品已删除。";
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("campusfit_profile_notice", flashNotice.value);
    }
    await store.refreshAll();
  } catch (error) {
    flashNotice.value = error?.message || "删除失败，请稍后重试。";
  }
}

function handleEmptyAction() {
  if (!emptyState.value.actionName) {
    return;
  }
  router.push({ name: emptyState.value.actionName });
}

function syncTabFromRoute(value) {
  const nextTab = String(value || "");
  activeTab.value = validTabs.includes(nextTab) ? nextTab : "posts";
}
</script>

<style scoped>
.section-panel--library {
  gap: 16px;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(214px, 280px));
  gap: 14px;
  justify-content: flex-start;
  align-items: start;
}

.library-grid :deep(.post-card) {
  width: 280px;
}

.draft-tile {
  width: 214px;
  overflow: hidden;
  display: grid;
  grid-template-rows: 132px 1fr;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.draft-tile__cover {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(145deg, rgba(20, 103, 245, 0.92), rgba(78, 181, 255, 0.8));
}

.draft-tile__cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 18, 29, 0.04), rgba(10, 18, 29, 0.18));
}

.draft-tile__cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.draft-tile__cover .media-pill,
.draft-tile__cover .media-label {
  z-index: 1;
}

.draft-tile__cover .media-pill {
  top: 10px;
  left: 10px;
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.draft-tile__cover .media-label {
  right: 10px;
  bottom: 10px;
  font-size: 11px;
}

.draft-tile__body,
.draft-tile__top {
  display: grid;
}

.draft-tile__body {
  gap: 10px;
  padding: 13px;
}

.draft-tile__top {
  gap: 6px;
}

.draft-tile__title {
  margin: 0;
  font-size: 17px;
  line-height: 1.18;
  letter-spacing: -0.04em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.draft-tile__copy {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.52;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.draft-tile__tags {
  gap: 6px;
}

.draft-tile__tags .tag-pill {
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.draft-tile__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 2px;
  border-top: 1px solid rgba(20, 103, 245, 0.08);
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}

.small-link--soft {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 103, 245, 0.08);
}

@media (max-width: 640px) {
  .library-grid {
    justify-content: center;
  }
}

.metric-card--button {
  position: relative;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.metric-card--button:hover {
  transform: translateY(-1px);
}

.metric-card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef5a5a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}
</style>


