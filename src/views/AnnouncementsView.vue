<template>
  <div class="detail-shell">
    <button class="ghost-button detail-shell__back" type="button" @click="goHome">返回首页</button>

    <section class="section-panel">
      <div class="section-head">
        <div class="section-head__main">
          <div class="section-title__eyebrow">Announcement</div>
          <h2 class="section-title">官方公告</h2>
        </div>

        <button class="ghost-button ghost-button--compact" type="button" :disabled="loading" @click="loadAnnouncements">
          {{ loading ? "加载中..." : "重新加载" }}
        </button>
      </div>

      <div class="page-head-metrics">
        <span class="page-head-metric">历史公告 {{ announcements.length }}</span>
        <span v-if="selectedAnnouncement" class="page-head-metric">
          当前高亮 {{ selectedAnnouncement.publishTime || "最新" }}
        </span>
      </div>
    </section>

    <section class="section-panel">
      <div v-if="loading" class="list-stack">
        <div v-for="item in 3" :key="`announcement-skeleton-${item}`" class="skeleton skeleton-card announcement-skeleton"></div>
      </div>

      <div v-else-if="loadFailed" class="empty-state">
        <div class="empty-state__title">公告加载失败</div>
        <p class="empty-state__copy">{{ statusText }}</p>
        <button class="primary-button empty-state__action" type="button" @click="loadAnnouncements">重新加载</button>
      </div>

      <div v-else-if="displayItems.length" class="announcement-timeline">
        <div class="announcement-timeline__line"></div>

        <button
          v-for="item in displayItems"
          :key="item.id"
          :class="['announcement-entry', item.highlighted ? 'announcement-entry--active' : '']"
          type="button"
          @click="focusAnnouncement(item.id)"
        >
          <span :class="['announcement-entry__node', item.nodeClass]">
            {{ item.iconText }}
          </span>

          <span class="announcement-entry__card">
            <span class="announcement-entry__head">
              <span :class="['announcement-entry__badge', item.badgeClass]">{{ item.badgeText }}</span>
              <span class="announcement-entry__date">{{ item.publishTime || "无" }}</span>
            </span>

            <span class="announcement-entry__title">{{ item.title || "无标题" }}</span>
            <span class="announcement-entry__summary">{{ item.summary || "暂无摘要" }}</span>

            <span v-if="item.content && item.content !== item.summary" class="announcement-entry__body">
              {{ item.content }}
            </span>

            <span class="announcement-entry__footer">
              <span>有效期</span>
              <span>{{ item.expireTime || "长期有效" }}</span>
            </span>
          </span>
        </button>

        <div class="announcement-end">
          <span class="announcement-end__dot"></span>
          <span class="announcement-end__copy">没有更多公告了</span>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state__title">暂无公告</div>
        <p class="empty-state__copy">当前没有可展示的历史公告。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const loadFailed = ref(false);
const statusText = ref("正在加载公告...");
const announcements = ref([]);

const selectedAnnouncementId = computed(() => {
  if (Array.isArray(route.query.id)) {
    return String(route.query.id[0] || "").trim();
  }
  return String(route.query.id || "").trim();
});

const displayItems = computed(() => normalizeAnnouncements(announcements.value, selectedAnnouncementId.value));

const selectedAnnouncement = computed(() => {
  return displayItems.value.find((item) => String(item.id) === selectedAnnouncementId.value) || null;
});

onMounted(() => {
  loadAnnouncements();
});

function resolveToneByBadge(badge) {
  const text = String(badge || "").trim();

  if (text.includes("重要")) {
    return {
      iconText: "!",
      nodeClass: "announcement-entry__node--danger",
      badgeClass: "announcement-entry__badge--danger"
    };
  }

  if (text.includes("活动")) {
    return {
      iconText: "活",
      nodeClass: "announcement-entry__node--mint",
      badgeClass: "announcement-entry__badge--mint"
    };
  }

  if (text.includes("资讯") || text.includes("通知")) {
    return {
      iconText: "讯",
      nodeClass: "announcement-entry__node--neutral",
      badgeClass: "announcement-entry__badge--neutral"
    };
  }

  return {
    iconText: "公",
    nodeClass: "announcement-entry__node--primary",
    badgeClass: "announcement-entry__badge--primary"
  };
}

function normalizeAnnouncements(list, currentId) {
  const selectedId = String(currentId || "");

  return (Array.isArray(list) ? list : []).map((item) => {
    const tone = resolveToneByBadge(item?.badge);

    return {
      ...item,
      ...tone,
      badgeText: String(item?.badge || "").trim() || "官方公告",
      highlighted: Boolean(selectedId) && String(item?.id || "") === selectedId
    };
  });
}

async function loadAnnouncements() {
  loading.value = true;
  loadFailed.value = false;
  statusText.value = "正在加载公告...";

  try {
    const result = await api.listAnnouncements();
    announcements.value = Array.isArray(result) ? result : [];
    statusText.value = "";
  } catch (error) {
    announcements.value = [];
    loadFailed.value = true;
    statusText.value = error?.message || "公告加载失败，请稍后再试";
  } finally {
    loading.value = false;
  }
}

function focusAnnouncement(id) {
  router.replace({
    name: "announcements",
    query: id ? { id: String(id) } : {}
  });
}

function goHome() {
  router.push({ name: "home" });
}
</script>

<style scoped>
.announcement-skeleton {
  min-height: 200px;
}

.announcement-timeline {
  position: relative;
  display: grid;
  gap: 18px;
  padding-bottom: 8px;
}

.announcement-timeline__line {
  position: absolute;
  left: 20px;
  top: 16px;
  bottom: 52px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(20, 103, 245, 0.2), rgba(56, 194, 163, 0.2));
}

.announcement-entry {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 18px;
  align-items: flex-start;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.announcement-entry__node {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 10px var(--surface-soft);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
}

.announcement-entry__node--primary {
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.96), rgba(78, 181, 255, 0.88));
}

.announcement-entry__node--danger {
  background: linear-gradient(135deg, rgba(221, 63, 63, 0.96), rgba(245, 125, 125, 0.88));
}

.announcement-entry__node--neutral {
  background: linear-gradient(135deg, rgba(87, 99, 117, 0.96), rgba(140, 154, 173, 0.88));
}

.announcement-entry__node--mint {
  background: linear-gradient(135deg, rgba(17, 111, 95, 0.96), rgba(88, 201, 176, 0.88));
}

.announcement-entry__card {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(20, 103, 245, 0.08);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}

.announcement-entry:hover .announcement-entry__card,
.announcement-entry:focus-visible .announcement-entry__card,
.announcement-entry--active .announcement-entry__card {
  transform: translateY(-2px);
  border-color: rgba(20, 103, 245, 0.24);
  box-shadow: var(--shadow-md);
}

.announcement-entry:focus-visible {
  outline: none;
}

.announcement-entry__head,
.announcement-entry__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.announcement-entry__badge {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.announcement-entry__badge--primary {
  background: rgba(20, 103, 245, 0.12);
  color: #1652b9;
}

.announcement-entry__badge--danger {
  background: rgba(221, 63, 63, 0.12);
  color: #b33838;
}

.announcement-entry__badge--neutral {
  background: rgba(87, 99, 117, 0.12);
  color: #4d5a6d;
}

.announcement-entry__badge--mint {
  background: rgba(17, 111, 95, 0.12);
  color: #146a5a;
}

.announcement-entry__date,
.announcement-entry__footer {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.announcement-entry__title {
  color: var(--text);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.announcement-entry__summary,
.announcement-entry__body {
  color: var(--muted-strong);
  font-size: 14px;
  line-height: 1.8;
}

.announcement-entry__body {
  padding-top: 2px;
}

.announcement-end {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding-left: 4px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.announcement-end__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(20, 103, 245, 0.16);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.84);
}

@media (max-width: 720px) {
  .announcement-entry {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .announcement-timeline__line {
    display: none;
  }

  .announcement-entry__node {
    box-shadow: none;
  }

  .announcement-entry__card {
    padding: 18px;
    border-radius: 22px;
  }

  .announcement-entry__title {
    font-size: 20px;
  }
}
</style>
