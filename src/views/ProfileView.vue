<template>
  <div class="page-shell">
    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后查看我的</div>
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
              <div class="metric-card">
                <strong>{{ store.state.profile?.following || 0 }}</strong>
                <span>关注</span>
              </div>
              <div class="metric-card">
                <strong>{{ store.state.profile?.followers || 0 }}</strong>
                <span>粉丝</span>
              </div>
              <div class="metric-card">
                <strong>{{ store.state.profile?.likes || 0 }}</strong>
                <span>获赞</span>
              </div>
              <div class="metric-card">
                <strong>{{ store.state.unreadCount || 0 }}</strong>
                <span>未读消息</span>
              </div>
            </div>
          </section>

          <section class="section-panel">
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
                  @click="activeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div v-if="activeTab !== 'drafts' && currentPosts.length" class="feed-grid">
              <PostCard
                v-for="post in currentPosts"
                :key="post.id"
                :post="post"
                @open="openPost"
              />
            </div>

            <div v-else-if="activeTab === 'drafts' && store.state.drafts.length" class="preview-grid">
              <article
                v-for="draft in store.state.drafts"
                :key="draft.id"
                class="draft-card"
              >
                <div class="draft-card__body">
                  <h3 class="draft-card__title">{{ draft.title }}</h3>
                  <p class="draft-card__copy">{{ draft.desc || "未填写描述" }}</p>
                  <div class="tag-row">
                    <span class="tag-pill">{{ draft.scene }}</span>
                    <span class="tag-pill">{{ draft.style }}</span>
                    <span class="tag-pill">{{ draft.budget || "预算未填" }}</span>
                  </div>
                  <div class="draft-card__meta">
                    <span>{{ draft.savedAt }}</span>
                    <button class="small-link" type="button" @click="openDraft(draft.id)">继续编辑</button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              <div class="empty-state__title">这里还没有内容</div>
              <button class="primary-button empty-state__action" type="button" @click="router.push({ name: 'publish' })">
                去发布
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
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import PostCard from "../components/PostCard.vue";
import { useAppStore } from "../stores/appStore";
import { getInitial } from "../utils/formatters";

const router = useRouter();
const store = useAppStore();

const tabs = [
  { id: "posts", label: "我的发布" },
  { id: "favorites", label: "收藏" },
  { id: "drafts", label: "草稿" }
];

const activeTab = ref("posts");

const currentPosts = computed(() => {
  if (activeTab.value === "favorites") {
    return store.state.favoritePosts;
  }
  return store.state.myPosts;
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
</script>
