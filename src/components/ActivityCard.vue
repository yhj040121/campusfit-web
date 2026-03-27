<template>
  <article
    class="activity-card refined-activity-card"
    role="button"
    tabindex="0"
    @click="$emit('open', activity.id)"
    @keydown.enter.prevent="$emit('open', activity.id)"
    @keydown.space.prevent="$emit('open', activity.id)"
  >
    <div :class="['activity-card__cover', coverToneClass, 'refined-activity-card__cover']">
      <div class="badge-list refined-activity-card__badge-list">
        <span :class="['status-pill', statusClass]">{{ activity.status }}</span>
        <span :class="['selectable-pill', { 'selectable-pill--off': !activity.selectable }]">
          {{ activity.selectable ? "发布可选" : "发布隐藏" }}
        </span>
      </div>

      <div class="refined-activity-card__eyebrow">{{ activity.badge }}</div>
      <h3 class="refined-activity-card__headline">{{ activity.title }}</h3>
      <p class="refined-activity-card__summary">{{ activity.summary }}</p>
    </div>

    <div class="activity-card__body refined-activity-card__body">
      <div class="refined-activity-card__meta">
        <span class="tag-pill">{{ activity.scene }}</span>
        <span class="tag-pill">{{ activity.period }}</span>
      </div>

      <div class="refined-activity-card__copy-block">
        <h3 class="activity-card__title">{{ activity.scene }}</h3>
        <p class="activity-card__copy">{{ activity.theme }}</p>
      </div>

      <div class="activity-card__foot">
        <span class="stat-inline">{{ activity.progressText }}</span>
        <span class="small-link">查看详情</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

defineEmits(["open"]);

const statusClass = computed(() => {
  if (props.activity.statusCategory === "finished") {
    return "status-pill--finished";
  }
  if (props.activity.statusCategory === "recruiting") {
    return "status-pill--recruiting";
  }
  return "status-pill--active";
});

const coverToneClass = computed(() => `activity-cover--${props.activity.tone || "blue"}`);
</script>

<style scoped>
.refined-activity-card {
  grid-template-columns: 1fr;
  grid-template-rows: 236px 1fr;
  height: 100%;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}

.refined-activity-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(20, 103, 245, 0.18);
}

.refined-activity-card:focus-visible {
  outline: 3px solid rgba(20, 103, 245, 0.18);
  outline-offset: 4px;
}

.refined-activity-card__cover {
  display: grid;
  align-content: end;
  gap: 12px;
  min-height: 0;
  padding: 20px;
}

.refined-activity-card__cover::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(12, 22, 31, 0.08), rgba(12, 22, 31, 0.42));
}

.refined-activity-card__badge-list,
.refined-activity-card__eyebrow,
.refined-activity-card__headline,
.refined-activity-card__summary {
  position: relative;
  z-index: 1;
}

.refined-activity-card__badge-list {
  margin-bottom: auto;
}

.refined-activity-card__eyebrow {
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.refined-activity-card__headline {
  margin: 0;
  color: #ffffff;
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.02;
  letter-spacing: -0.05em;
}

.refined-activity-card__summary {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.75;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.refined-activity-card__body {
  align-content: start;
  gap: 14px;
}

.refined-activity-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.refined-activity-card__copy-block {
  display: grid;
  gap: 10px;
}

.activity-card__title {
  margin: 0;
  font-size: 22px;
}

.activity-card__copy {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.75;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-card__foot {
  align-items: flex-end;
}

.stat-inline {
  white-space: normal;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .refined-activity-card {
    grid-template-rows: 212px 1fr;
  }

  .refined-activity-card__cover {
    padding: 18px;
  }

  .refined-activity-card__headline {
    font-size: 32px;
  }
}
</style>
