<template>
  <article class="post-card" @click="$emit('open', post.id)">
    <div :class="['post-card__media', toneClass]">
      <img v-if="post.coverUrl" class="post-card__image" :src="post.coverUrl" :alt="post.title">
      <span class="media-pill">{{ post.coverTag }}</span>
      <span class="media-label">{{ post.publishTime }}</span>
    </div>

    <div class="post-card__body">
      <div>
        <h3 class="post-card__title">{{ post.title }}</h3>
        <p class="post-card__desc">{{ post.desc }}</p>
      </div>

      <div class="tag-row">
        <span class="tag-pill">{{ post.scene }}</span>
        <span class="tag-pill">{{ post.style }}</span>
        <span v-if="post.budget" class="tag-pill">预算 {{ post.budget }}</span>
      </div>

      <div class="post-card__foot">
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

        <span class="stat-inline">{{ formatCount(post.likes) }} 赞 · {{ formatCount(post.comments) }} 评</span>
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
  }
});

defineEmits(["open"]);

const toneClass = computed(() => {
  return `post-card__media--tone-${props.post.tone || "blue"}`;
});
</script>
