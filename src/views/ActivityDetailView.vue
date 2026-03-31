<template>
  <div class="detail-shell">
    <button class="ghost-button detail-shell__back" type="button" @click="goBack">返回活动中心</button>

    <div v-if="loading" class="detail-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="list-stack">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    </div>

    <template v-else-if="activity">
      <section class="gallery-stage">
        <div class="gallery-stage__overlay"></div>
        <div class="gallery-stage__body">
          <div class="badge-list">
            <span :class="['status-pill', statusClass]">{{ activity.status }}</span>
            <span :class="['selectable-pill', { 'selectable-pill--off': !activity.selectable }]">
              {{ activity.selectable ? "发布时可选择" : "发布时不显示" }}
            </span>
          </div>

          <div>
            <div class="hero-card__eyebrow">{{ activity.badge }}</div>
            <h1 class="gallery-stage__title">{{ activity.title }}</h1>
            <p class="gallery-stage__copy">{{ activity.summary }}</p>
          </div>

          <div class="meta-inline">
            <span>{{ activity.period }}</span>
            <span>{{ activity.scene }}</span>
            <span>{{ activity.progressText }}</span>
          </div>
        </div>
      </section>

      <section class="detail-grid">
        <div class="detail-stack">
          <section class="drawer-block">
            <div class="drawer-block__eyebrow">Overview</div>
            <h2 class="drawer-block__title">活动说明</h2>
            <p class="detail-copy">{{ activity.theme }}</p>

            <div class="detail-kpis">
              <div class="detail-kpi">
                <strong>热度（点赞+评论）</strong>
                <span>{{ activity.heat }}</span>
              </div>
              <div class="detail-kpi">
                <strong>内容数</strong>
                <span>{{ activity.entries }}</span>
              </div>
              <div class="detail-kpi">
                <strong>当前状态</strong>
                <span>{{ activity.status }}</span>
              </div>
            </div>
          </section>

          <section class="drawer-block">
            <div class="detail-section-title">奖励说明</div>
            <p class="detail-copy">{{ activity.reward }}</p>
          </section>

          <section class="drawer-block">
            <div class="detail-section-title">参与方式</div>
            <p class="detail-copy">{{ activity.participation }}</p>
          </section>

          <section v-if="relatedPosts.length" class="section-panel">
            <div class="section-head">
              <div class="section-head__main">
                <div class="section-title__eyebrow">Related</div>
                <h2 class="section-title">关联内容</h2>
              </div>
            </div>

            <div class="feed-grid">
              <PostCard
                v-for="post in relatedPosts"
                :key="post.id"
                :post="post"
                @open="openPost"
              />
            </div>
          </section>
        </div>

        <aside class="list-stack">
          <section class="drawer-block">
            <div class="drawer-block__eyebrow">Action</div>
            <h2 class="drawer-block__title">当前参与状态</h2>
            <p class="drawer-block__copy">{{ activity.statusCopy }}</p>

            <div class="detail-actions">
              <button class="primary-button" type="button" @click="handleJoinToggle">
                {{ activity.joined ? "退出活动" : "加入活动" }}
              </button>
              <button
                class="outline-button"
                type="button"
                :disabled="!activity.selectable"
                @click="goPublish"
              >
                选择这个活动去发布
              </button>
            </div>

            <p v-if="!activity.selectable" class="detail-note detail-note--warning">
              这个活动当前被标记为“不可选”，所以用户在发布内容时不会在活动选择列表里看到它。
            </p>
          </section>

          <section class="drawer-block">
            <div class="drawer-block__eyebrow">Info</div>
            <h2 class="drawer-block__title">活动标签</h2>
            <div class="detail-tag-cloud">
              <span class="tag-pill">{{ activity.scene }}</span>
              <span class="tag-pill">{{ activity.period }}</span>
              <span class="tag-pill">{{ activity.status }}</span>
            </div>
          </section>
        </aside>
      </section>
    </template>

    <div v-else class="empty-state">
      <div class="empty-state__title">活动不存在或暂时不可用</div>
      <p class="empty-state__copy">{{ errorText || "请检查活动是否已下线，或稍后重新进入。" }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAppStore } from "../stores/appStore";

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const loading = ref(true);
const errorText = ref("");
const activity = ref(null);

const activityId = computed(() => String(route.params.id || ""));

const relatedPosts = computed(() => {
  if (!activity.value) {
    return [];
  }
  return store.state.posts.filter((item) => String(item.activity?.id || "") === String(activity.value.id));
});

const statusClass = computed(() => {
  if (!activity.value) {
    return "status-pill--active";
  }
  if (activity.value.statusCategory === "finished") {
    return "status-pill--finished";
  }
  if (activity.value.statusCategory === "recruiting") {
    return "status-pill--recruiting";
  }
  return "status-pill--active";
});

watch(
  activityId,
  async () => {
    await loadActivity();
  },
  { immediate: true }
);

async function loadActivity() {
  loading.value = true;
  errorText.value = "";

  const local = store.state.activities.find((item) => String(item.id) === activityId.value);
  if (local) {
    activity.value = local;
  }

  try {
    const result = await api.getActivityDetail(activityId.value);
    activity.value = store.normalizeActivity(result);
  } catch (error) {
    if (!local) {
      activity.value = null;
      errorText.value = error?.message || "活动加载失败";
    }
  } finally {
    loading.value = false;
  }
}

async function handleJoinToggle() {
  if (!store.isAuthed.value) {
    store.openLoginDialog();
    return;
  }
  try {
    const result = await api.toggleActivityJoin(activityId.value);
    activity.value = store.normalizeActivity(result);
    await store.loadPublicData();
    await store.loadPrivateData();
  } catch (error) {
    errorText.value = error?.message || "活动状态更新失败";
  }
}

function goPublish() {
  if (!activity.value?.selectable) {
    return;
  }
  router.push({ name: "publish", query: { activityId: activityId.value } });
}

function openPost(id) {
  router.push({ name: "post-detail", params: { id } });
}

function goBack() {
  router.push({ name: "activities" });
}
</script>
