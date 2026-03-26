<template>
  <article
    :class="[featured ? 'activity-hero' : 'activity-card']"
    @click="$emit('open', activity.id)"
  >
    <div :class="[featured ? 'activity-hero__cover' : 'activity-card__cover', coverToneClass]">
      <div class="badge-list">
        <span :class="['status-pill', statusClass]">{{ activity.status }}</span>
        <span :class="['selectable-pill', { 'selectable-pill--off': !activity.selectable }]">
          {{ activity.selectable ? "发布可选" : "发布不可选" }}
        </span>
      </div>
      <div class="hero-card__meta">{{ activity.badge }}</div>
      <h3 class="hero-card__title">{{ featured ? activity.title : activity.scene }}</h3>
      <p v-if="featured" class="hero-card__copy">{{ activity.summary }}</p>
    </div>

    <div class="activity-card__body">
      <div>
        <h3 class="activity-card__title">{{ featured ? activity.scene : activity.title }}</h3>
        <p class="activity-card__copy">{{ featured ? activity.period : activity.summary }}</p>
      </div>
      <div class="tag-row">
        <span class="tag-pill">{{ activity.period }}</span>
        <span :class="['tag-pill', { 'tag-pill--muted': !activity.selectable }]">
          {{ activity.selectable ? "可在发布时选择" : "发布时隐藏" }}
        </span>
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
  },
  featured: Boolean
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
