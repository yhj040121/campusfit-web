<template>
  <article
    :class="['post-card', compact ? 'post-card--compact' : '', !post.canViewDetail ? 'post-card--disabled' : '']"
    @click="handleOpen"
  >
    <div :class="['post-card__media', toneClass]">
      <img v-if="post.coverUrl" class="post-card__image" :src="post.coverUrl" :alt="post.title">
      <span class="media-pill">{{ post.coverTag }}</span>
      <span class="media-label">{{ post.publishTime }}</span>
    </div>

    <div class="post-card__body">
      <div class="post-card__top">
        <span v-if="showStatusBadge" :class="['status-badge', statusBadgeClass]">{{ post.publishStatusText }}</span>
        <h3 class="post-card__title">{{ post.title }}</h3>
        <p v-if="showStatusBadge && post.publishStatusDesc" class="post-card__status-copy">{{ post.publishStatusDesc }}</p>
        <p v-else class="post-card__desc">{{ post.desc }}</p>
      </div>

      <div class="tag-row post-card__tags">
        <span class="tag-pill">{{ post.scene }}</span>
        <span class="tag-pill">{{ post.style }}</span>
        <span v-if="post.budget" class="tag-pill">预算 {{ post.budget }}</span>
      </div>

      <div class="post-card__meta-block">
        <div class="author-inline">
          <div class="author-inline__avatar">
            <img v-if="post.avatarUrl" :src="post.avatarUrl" :alt="post.user">
            <span v-else>{{ getInitial(post.user, post.avatar) }}</span>
          </div>
          <div class="author-inline__body">
            <span class="author-inline__name">{{ post.user }}</span>
            <span class="author-inline__meta">{{ post.school }}</span>
          </div>
        </div>

        <span class="stat-inline">{{ formatCount(post.likes) }} 赞 · {{ formatCount(post.comments) }} 评论</span>
      </div>

      <div v-if="showOwnerActions && (canEdit || canDelete)" class="post-card__owner-actions">
        <button
          v-if="canEdit"
          class="small-link small-link--soft"
          type="button"
          @click.stop="emit('edit', post)"
        >
          修改后重提
        </button>
        <button
          v-if="canDelete"
          class="small-link small-link--soft small-link--danger"
          type="button"
          @click.stop="emit('remove', post)"
        >
          删除作品
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { formatCount, getInitial } from "../utils/formatters";

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  showOwnerActions: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["open", "edit", "remove"]);

const toneClass = computed(() => {
  return `post-card__media--tone-${props.post.tone || "blue"}`;
});

const showStatusBadge = computed(() => {
  return !!props.post.publishStatus && props.post.publishStatus !== "PUBLISHED";
});

const statusBadgeClass = computed(() => {
  if (props.post.publishStatus === "REJECTED") {
    return "status-badge--error";
  }
  return "status-badge--preview";
});

const canEdit = computed(() => {
  return props.showOwnerActions;
});

const canDelete = computed(() => {
  return props.showOwnerActions;
});

function handleOpen() {
  if (props.post.canViewDetail === false) {
    if (canEdit.value) {
      emit("edit", props.post);
    }
    return;
  }
  emit("open", props.post.id);
}
</script>

<style scoped>
.post-card__top,
.post-card__meta-block {
  display: grid;
  gap: 8px;
}

.post-card--disabled {
  cursor: default;
}

.post-card__status-copy {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.post-card__owner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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

.small-link--danger {
  color: #d14343;
  background: rgba(235, 109, 109, 0.12);
}

.post-card--compact {
  min-height: 100%;
  grid-template-rows: 132px 1fr;
  border-radius: 24px;
}

.post-card--compact .post-card__media::after {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(12, 22, 31, 0.04), rgba(12, 22, 31, 0.2));
}

.post-card--compact .media-pill {
  top: 10px;
  left: 10px;
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.post-card--compact .media-label {
  right: 10px;
  bottom: 10px;
  font-size: 11px;
}

.post-card--compact .post-card__body {
  gap: 10px;
  padding: 13px;
}

.post-card--compact .status-badge {
  margin-top: 0;
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.post-card--compact .post-card__title {
  margin: 0;
  font-size: 17px;
  line-height: 1.18;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--compact .post-card__status-copy,
.post-card--compact .post-card__desc {
  font-size: 12px;
  line-height: 1.52;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card--compact .post-card__tags {
  gap: 6px;
}

.post-card--compact .tag-pill {
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
}

.post-card--compact .author-inline {
  gap: 9px;
}

.post-card--compact .author-inline__avatar {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  font-size: 11px;
}

.post-card--compact .author-inline__name {
  font-size: 12px;
}

.post-card--compact .author-inline__meta,
.post-card--compact .stat-inline,
.post-card--compact .small-link {
  font-size: 11px;
  line-height: 1.35;
}

.post-card--compact .stat-inline {
  color: var(--muted-strong);
}

.post-card--compact .post-card__meta-block {
  gap: 7px;
}

.post-card--compact .post-card__owner-actions {
  padding-top: 2px;
  border-top: 1px solid rgba(20, 103, 245, 0.08);
}
</style>
