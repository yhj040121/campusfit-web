<template>
  <div class="page-shell">
    <button class="ghost-button detail-shell__back" type="button" @click="goHome">返回首页</button>

    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后查看消息列表</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
      </div>
    </section>

    <template v-else>
      <section class="section-panel">
        <div class="section-head">
          <div class="section-head__main">
            <div class="section-title__eyebrow">Messages</div>
            <h2 class="section-title">消息列表</h2>
          </div>

          <div class="button-row">
            <button class="ghost-button ghost-button--compact" type="button" :disabled="loading || !unreadCount" @click="markAllReadAction">
              全部已读
            </button>
            <button class="ghost-button ghost-button--compact" type="button" :disabled="loading || !readCount" @click="clearReadAction">
              清理已读
            </button>
          </div>
        </div>

        <div class="page-head-metrics">
          <span class="page-head-metric">全部 {{ messages.length }}</span>
          <span class="page-head-metric">未读 {{ unreadCount }}</span>
          <span class="page-head-metric">已读 {{ readCount }}</span>
        </div>
      </section>

      <section class="section-panel">
        <div v-if="loading" class="list-stack">
          <div v-for="item in 3" :key="item" class="skeleton skeleton-card message-skeleton"></div>
        </div>

        <div v-else-if="messages.length" class="message-list">
          <article
            v-for="message in messages"
            :key="message.id"
            :class="['message-card', message.read ? 'message-card--read' : 'message-card--unread']"
          >
            <div class="message-card__head">
              <span :class="['message-card__badge', message.read ? 'message-card__badge--read' : 'message-card__badge--unread']">
                {{ resolveTypeText(message.type) }}
              </span>
              <span class="message-card__time">{{ message.time }}</span>
            </div>

            <h3 class="message-card__title">{{ message.title || '系统消息' }}</h3>
            <p class="message-card__copy">{{ message.desc || '暂无消息内容。' }}</p>

            <div class="message-card__foot">
              <span class="message-card__state">{{ message.read ? '已读' : '未读' }}</span>
              <div class="button-row">
                <button v-if="!message.read" class="outline-button message-card__action" type="button" @click="markReadAction(message.id)">
                  标记已读
                </button>
                <button class="ghost-button message-card__action" type="button" @click="deleteMessageAction(message.id)">
                  删除
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state__title">暂无消息</div>
          <p class="empty-state__copy">重要通知、审核提醒和系统反馈都会展示在这里。</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as api from "../api/client";
import { useAppStore } from "../stores/appStore";

const router = useRouter();
const store = useAppStore();

const loading = ref(false);
const messages = ref([]);

const unreadCount = computed(() => messages.value.filter((item) => !item.read).length);
const readCount = computed(() => messages.value.filter((item) => item.read).length);

onMounted(() => {
  if (store.isAuthed.value) {
    seedMessagesFromStore();
    loadMessages();
  }
});

watch(
  () => store.isAuthed.value,
  (authed) => {
    if (authed) {
      seedMessagesFromStore();
      loadMessages();
      return;
    }
    messages.value = [];
  }
);

function resolveTypeText(type) {
  const text = String(type || "").trim();
  if (!text) {
    return "系统通知";
  }
  return text;
}

async function loadMessages() {
  loading.value = !messages.value.length;
  try {
    const result = await api.listMessages();
    messages.value = Array.isArray(result) ? result : [];
    store.state.messages = messages.value;
    syncUnreadCount();
  } finally {
    loading.value = false;
  }
}

async function markReadAction(messageId) {
  await api.markMessageRead(messageId);
  await loadMessages();
}

async function markAllReadAction() {
  await api.markAllMessagesRead();
  await loadMessages();
}

async function clearReadAction() {
  const confirmed = await store.confirmDialog({
    eyebrow: "Messages",
    title: "清理已读消息",
    message: "确定清理所有已读消息吗？清理后无法恢复。",
    confirmText: "确认清理",
    cancelText: "暂不清理",
    tone: "danger"
  });
  if (!confirmed) {
    return;
  }
  await api.deleteReadMessages();
  await loadMessages();
}

async function deleteMessageAction(messageId) {
  await api.deleteMessage(messageId);
  await loadMessages();
}

function goHome() {
  router.push({ name: "home" });
}

function syncUnreadCount() {
  store.state.unreadCount = messages.value.filter((item) => !item.read).length;
}

function seedMessagesFromStore() {
  messages.value = Array.isArray(store.state.messages) ? [...store.state.messages] : [];
}
</script>

<style scoped>
.message-skeleton {
  min-height: 180px;
}

.message-list {
  display: grid;
  gap: 14px;
}

.message-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(20, 103, 245, 0.08);
  box-shadow: var(--shadow-sm);
}

.message-card--unread {
  border-color: rgba(20, 103, 245, 0.18);
  box-shadow: var(--shadow-md);
}

.message-card__head,
.message-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.message-card__badge {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.message-card__badge--unread {
  color: #1652b9;
  background: rgba(20, 103, 245, 0.12);
}

.message-card__badge--read {
  color: var(--muted-strong);
  background: rgba(96, 114, 134, 0.12);
}

.message-card__time,
.message-card__state {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.message-card__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.message-card__copy {
  margin: 0;
  color: var(--muted-strong);
  font-size: 14px;
  line-height: 1.75;
}

.message-card__action {
  min-height: 40px;
}
</style>
