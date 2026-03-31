<template>
  <div class="page-shell">
    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后查看合作单</div>
      <p class="helper-inline">这里会集中展示管理员发来的合作邀请、执行中的合作单和待发放奖励的进度。</p>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
        <button class="ghost-button" type="button" @click="router.push({ name: 'profile' })">先去我的主页</button>
      </div>
    </section>

    <template v-else>
      <section class="section-panel cooperation-hero">
        <div class="section-title__eyebrow">Cooperation</div>
        <div class="cooperation-hero__head">
          <div>
            <h1 class="section-title">我的合作</h1>
            <p class="cooperation-hero__copy">先确认合作，再去发布页绑定内容；审核达标后，后台就能按合作单发放奖励。</p>
          </div>
          <div class="cooperation-hero__actions">
            <button class="ghost-button" type="button" :disabled="loading" @click="loadCooperations()">
              {{ loading ? "刷新中..." : "刷新合作单" }}
            </button>
            <button class="primary-button" type="button" @click="router.push({ name: 'publish' })">直接去发布</button>
          </div>
        </div>

        <div class="metric-grid">
          <div class="metric-card">
            <strong>{{ cooperations.length }}</strong>
            <span>全部合作单</span>
          </div>
          <div class="metric-card">
            <strong>{{ pendingCount }}</strong>
            <span>待确认</span>
          </div>
          <div class="metric-card">
            <strong>{{ runningCount }}</strong>
            <span>执行中</span>
          </div>
          <div class="metric-card">
            <strong>{{ rewardReadyCount }}</strong>
            <span>待发奖励</span>
          </div>
        </div>
      </section>

      <section v-if="errorText" class="section-panel">
        <p class="helper-inline helper-inline--warn">{{ errorText }}</p>
      </section>

      <section v-if="loading && !cooperations.length" class="cooperation-list">
        <article v-for="item in 3" :key="`skeleton-${item}`" class="section-panel cooperation-card cooperation-card--skeleton"></article>
      </section>

      <section v-else-if="cooperations.length" class="cooperation-list">
        <article
          v-for="item in cooperations"
          :key="item.id"
          class="section-panel cooperation-card"
        >
          <div class="cooperation-card__head">
            <div>
              <div class="cooperation-card__merchant">{{ item.merchantName }}</div>
              <h2 class="cooperation-card__title">{{ item.title }}</h2>
            </div>
            <span :class="['status-pill', statusClass(item)]">{{ item.status }}</span>
          </div>

          <p class="cooperation-card__desc">{{ item.desc || "管理员已创建合作单，确认后即可在发布页绑定内容。" }}</p>

          <div class="tag-row">
            <span class="tag-pill">奖励 {{ item.rewardAmount }}</span>
            <span class="tag-pill">{{ item.progressText }}</span>
            <span class="tag-pill">{{ item.deadlineAt !== "-" ? `截止 ${item.deadlineAt}` : "截止时间待更新" }}</span>
          </div>

          <div class="cooperation-requirement">
            <div class="cooperation-requirement__head">
              <strong>合作要求</strong>
              <span>{{ item.rewardIssued ? "已发放奖励" : (item.rewardReady ? "等待发奖" : "确认后按要求执行") }}</span>
            </div>
            <p class="cooperation-requirement__copy">{{ item.desc || "无要求" }}</p>
            <div class="cooperation-requirement__list">
              <span>达标条件：{{ item.ruleText }}</span>
              <span>奖励金额：{{ item.rewardAmount }}</span>
              <span>{{ item.deadlineAt !== "-" ? `截止时间：${item.deadlineAt}` : "截止时间：无" }}</span>
            </div>
          </div>

          <div class="cooperation-progress">
            <div class="cooperation-progress__meta">
              <strong>绑定进度</strong>
              <span>{{ item.approvedPostCount }}/{{ item.targetPostCount }} 已通过</span>
            </div>
            <div class="cooperation-progress__bar">
              <span class="cooperation-progress__fill" :style="{ width: `${item.progressPercent}%` }"></span>
            </div>
            <div class="cooperation-progress__sub">
              <span>已提交 {{ item.submittedPostCount }} 条</span>
              <span v-if="item.rewardIssued">奖励已发放</span>
              <span v-else-if="item.rewardReady">等待后台发奖</span>
              <span v-else-if="item.canPublish">可继续绑定发布</span>
              <span v-else>确认后才可绑定</span>
            </div>
          </div>

          <div class="button-row cooperation-card__actions">
            <button
              v-if="item.canAccept"
              class="primary-button"
              type="button"
              :disabled="actionKey === `accept-${item.id}`"
              @click="handleAccept(item)"
            >
              {{ actionKey === `accept-${item.id}` ? "确认中..." : "确认合作" }}
            </button>
            <button
              v-if="item.canPublish"
              class="primary-button"
              type="button"
              @click="goPublish(item)"
            >
              去发布绑定
            </button>
            <button
              v-else-if="item.canAccept"
              class="ghost-button cooperation-card__danger-action"
              type="button"
              :disabled="actionKey === `reject-${item.id}`"
              @click="handleReject(item)"
            >
              {{ actionKey === `reject-${item.id}` ? "处理中..." : "拒绝合作" }}
            </button>
            <button
              v-else
              class="ghost-button"
              type="button"
              @click="router.push({ name: 'profile', query: { tab: 'posts' } })"
            >
              查看我的发布
            </button>
          </div>
        </article>
      </section>

      <section v-else class="section-panel empty-state">
        <div class="empty-state__title">还没有合作单</div>
        <p class="empty-state__copy">管理员创建合作单后，这里会展示待确认、执行中和待发放奖励的全部状态。</p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as api from "../api/client";
import { firstText, formatMoney, safeText } from "../utils/formatters";
import { useAppStore } from "../stores/appStore";

const router = useRouter();
const store = useAppStore();

const loading = ref(false);
const actionKey = ref("");
const errorText = ref("");
const cooperations = ref([]);

const pendingCount = computed(() => cooperations.value.filter((item) => item.canAccept).length);
const runningCount = computed(() => cooperations.value.filter((item) => item.canPublish && !item.rewardReady && !item.rewardIssued).length);
const rewardReadyCount = computed(() => cooperations.value.filter((item) => item.rewardReady && !item.rewardIssued).length);

watch(
  () => store.isAuthed.value,
  (authed) => {
    if (!authed) {
      cooperations.value = [];
      errorText.value = "";
      return;
    }
    loadCooperations();
  },
  { immediate: true }
);

onMounted(() => {
  if (!store.state.bootstrapped) {
    store.bootstrap();
  }
});

function normalizeCooperation(item) {
  const targetPostCount = Math.max(Number(item?.targetPostCount || 1), 1);
  const approvedPostCount = Math.max(Number(item?.approvedPostCount || 0), 0);
  return {
    id: safeText(item?.id),
    cooperationId: Number(item?.cooperationId || 0),
    title: safeText(item?.title, "未命名合作单"),
    merchantName: safeText(item?.merchantName, "合作品牌"),
    desc: safeText(item?.desc),
    status: safeText(item?.status, "待确认"),
    rewardAmount: formatMoney(item?.rewardAmount || 0),
    targetPostCount,
    approvedPostCount,
    submittedPostCount: Math.max(Number(item?.submittedPostCount || 0), 0),
    targetLikeCount: Math.max(Number(item?.targetLikeCount || 0), 0),
    approvedLikeCount: Math.max(Number(item?.approvedLikeCount || 0), 0),
    deadlineAt: safeText(item?.deadlineAt, "-"),
    canAccept: !!item?.canAccept,
    accepted: !!item?.accepted,
    canPublish: !!item?.canPublish,
    canAbandon: !!item?.canAbandon,
    rewardReady: !!item?.rewardReady,
    rewardIssued: !!item?.rewardIssued,
    ruleText: safeText(item?.ruleText, "以后台合作要求为准"),
    progressText: safeText(item?.progressText, "等待管理员确认合作进度。"),
    progressPercent: Math.max(0, Math.min(100, Math.round((approvedPostCount / targetPostCount) * 100)))
  };
}

function buildAcceptConfirmContent(item) {
  const lines = [
    `合作要求：${safeText(item?.desc, "请按卡片展示的合作要求执行")}`,
    `达标条件：${safeText(item?.ruleText, "以后台合作要求为准")}`,
    `奖励金额：${safeText(item?.rewardAmount, "¥0.00")}`,
    item?.deadlineAt && item.deadlineAt !== "-" ? `截止时间：${item.deadlineAt}` : "截止时间：无"
  ];
  lines.push("确认后即可去发布页绑定内容并开始累计进度。");
  return lines.join("\n\n");
}

async function loadCooperations() {
  if (!store.isAuthed.value) {
    return;
  }
  loading.value = true;
  errorText.value = "";
  try {
    const result = await api.listMyCooperations();
    cooperations.value = (Array.isArray(result) ? result : []).map(normalizeCooperation);
  } catch (error) {
    errorText.value = error?.message || "加载合作单失败，请稍后再试。";
  } finally {
    loading.value = false;
  }
}

function statusClass(item) {
  if (item.rewardIssued) {
    return "status-pill--finished";
  }
  if (item.rewardReady) {
    return "status-pill--recruiting";
  }
  if (item.canPublish) {
    return "status-pill--active";
  }
  return "";
}

async function handleAccept(item) {
  const confirmed = await store.confirmDialog({
    eyebrow: "Cooperation",
    title: "确认合作",
    message: buildAcceptConfirmContent(item),
    confirmText: "确认合作",
    cancelText: "再想想"
  });
  if (!confirmed) {
    return;
  }
  try {
    actionKey.value = `accept-${item.id}`;
    const result = await api.acceptCooperation(item.id);
    const normalized = normalizeCooperation(result);
    cooperations.value = cooperations.value.map((current) => (current.id === normalized.id ? normalized : current));
  } catch (error) {
    errorText.value = error?.message || "合作确认失败，请稍后重试。";
  } finally {
    actionKey.value = "";
  }
}

async function handleReject(item) {
  const confirmed = await store.confirmDialog({
    eyebrow: "Cooperation",
    title: "拒绝合作邀请",
    message: "拒绝后这条合作邀请不会进入执行中，确定继续吗？",
    confirmText: "确认拒绝",
    cancelText: "保留邀请",
    tone: "danger"
  });
  if (!confirmed) {
    return;
  }
  try {
    actionKey.value = `reject-${item.id}`;
    const result = await api.abandonCooperation(item.id);
    const normalized = normalizeCooperation(result);
    cooperations.value = cooperations.value.map((current) => (current.id === normalized.id ? normalized : current));
  } catch (error) {
    errorText.value = error?.message || "拒绝合作失败，请稍后重试。";
  } finally {
    actionKey.value = "";
  }
}

function goPublish(item) {
  const cooperationId = firstText(item?.id);
  router.push({
    name: "publish",
    query: cooperationId ? { cooperationId } : {}
  });
}
</script>

<style scoped>
.cooperation-hero {
  gap: 20px;
}

.cooperation-hero__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cooperation-hero__copy {
  margin: 10px 0 0;
  max-width: 720px;
  color: var(--muted);
  line-height: 1.7;
}

.cooperation-hero__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cooperation-list {
  display: grid;
  gap: 16px;
}

.cooperation-card {
  display: grid;
  gap: 16px;
}

.cooperation-card--skeleton {
  min-height: 220px;
  background:
    linear-gradient(90deg, rgba(238, 243, 247, 0.88) 25%, rgba(248, 251, 255, 0.98) 37%, rgba(238, 243, 247, 0.88) 63%);
  background-size: 300% 100%;
  animation: cooperationShimmer 1.4s infinite linear;
}

.cooperation-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cooperation-card__merchant {
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cooperation-card__title {
  margin: 8px 0 0;
  font-size: 26px;
  line-height: 1.18;
  letter-spacing: -0.04em;
}

.cooperation-card__desc {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}

.cooperation-requirement {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(20, 103, 245, 0.05);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.cooperation-requirement__head,
.cooperation-requirement__list {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cooperation-requirement__head strong {
  font-size: 14px;
}

.cooperation-requirement__head span,
.cooperation-requirement__list span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.cooperation-requirement__copy {
  margin: 0;
  color: var(--text);
  line-height: 1.7;
}

.cooperation-progress {
  display: grid;
  gap: 10px;
}

.cooperation-progress__meta,
.cooperation-progress__sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.cooperation-progress__meta strong {
  font-size: 14px;
}

.cooperation-progress__meta span,
.cooperation-progress__sub span {
  color: var(--muted);
  font-size: 13px;
}

.cooperation-progress__bar {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(20, 103, 245, 0.08);
}

.cooperation-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(20, 103, 245, 0.92), rgba(56, 194, 163, 0.88));
}

.cooperation-card__actions {
  justify-content: flex-start;
}

.cooperation-card__danger-action {
  color: #b42318;
  border-color: rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.06);
}

.helper-inline--warn {
  color: #b45309;
  background: rgba(245, 158, 11, 0.1);
}

@keyframes cooperationShimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 720px) {
  .cooperation-card__title {
    font-size: 22px;
  }

  .cooperation-hero__actions {
    width: 100%;
  }

  .cooperation-hero__actions > * {
    flex: 1 1 0;
  }
}
</style>
