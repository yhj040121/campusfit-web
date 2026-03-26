<template>
  <div class="page-shell">
    <section class="section-panel">
      <div class="section-head">
        <div class="section-head__main">
          <div class="section-title__eyebrow">Activities</div>
          <h2 class="section-title">活动中心</h2>
        </div>

        <div class="filter-row">
          <button
            v-for="item in filters"
            :key="item.id"
            :class="['filter-chip', activeFilter === item.id ? 'filter-chip--active' : '']"
            type="button"
            @click="activeFilter = item.id"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="page-head-metrics">
        <span class="page-head-metric">全部 {{ store.state.activities.length }}</span>
        <span class="page-head-metric">可发布 {{ store.selectableActivities.value.length }}</span>
        <span class="page-head-metric">已参与 {{ store.state.myActivities.length }}</span>
      </div>

      <template v-if="headlineActivity">
        <ActivityCard featured :activity="headlineActivity" @open="openActivity" />

        <div v-if="restActivities.length" class="activity-grid">
          <ActivityCard
            v-for="activity in restActivities"
            :key="activity.id"
            :activity="activity"
            @open="openActivity"
          />
        </div>
      </template>

      <div v-else class="empty-state">
        <div class="empty-state__title">还没有活动</div>
        <p class="empty-state__copy">请稍后刷新。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ActivityCard from "../components/ActivityCard.vue";
import { useAppStore } from "../stores/appStore";

const router = useRouter();
const store = useAppStore();

const filters = [
  { id: "all", label: "全部" },
  { id: "hot", label: "热门" },
  { id: "active", label: "进行中" },
  { id: "finished", label: "已结束" }
];

const activeFilter = ref("all");

const filteredActivities = computed(() => {
  if (activeFilter.value === "hot") {
    return [...store.state.activities].sort((left, right) => right.heat - left.heat);
  }
  if (activeFilter.value === "active") {
    return store.state.activities.filter((item) => item.statusCategory !== "finished");
  }
  if (activeFilter.value === "finished") {
    return store.state.activities.filter((item) => item.statusCategory === "finished");
  }
  return store.state.activities;
});

const headlineActivity = computed(() => filteredActivities.value[0] || null);
const restActivities = computed(() => filteredActivities.value.slice(1));

function openActivity(id) {
  router.push({ name: "activity-detail", params: { id } });
}
</script>
