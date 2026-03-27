<template>
  <div class="detail-shell">
    <button class="ghost-button detail-shell__back" type="button" @click="goBack">返回首页</button>

    <div v-if="loading" class="detail-grid detail-grid--single">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>

    <template v-else-if="post">
      <section class="detail-grid">
        <div class="detail-stack">
          <section class="gallery-stage">
            <img
              v-if="currentImage"
              class="gallery-stage__image"
              :src="currentImage"
              :alt="post.title"
            >
            <div v-if="currentImage" class="gallery-stage__counter">
              {{ activeImageIndex + 1 }}/{{ post.imageUrls.length || 1 }}
            </div>
            <div class="gallery-stage__body">
              <div class="meta-inline">
                <span>{{ post.coverTag }}</span>
                <span>{{ post.publishTime }}</span>
                <span v-if="post.activity">{{ post.activity.title }}</span>
              </div>

              <div>
                <h1 class="gallery-stage__title">{{ post.title }}</h1>
                <p class="gallery-stage__copy">{{ post.desc }}</p>
              </div>

              <div class="meta-inline">
                <span>{{ post.scene }}</span>
                <span>{{ post.style }}</span>
                <span v-if="post.budget">预算 {{ post.budget }}</span>
              </div>
            </div>
          </section>

          <section v-if="false" class="detail-hero-copy-card">
            <div class="meta-inline meta-inline--ink">
              <span>{{ post.coverTag }}</span>
              <span>{{ post.publishTime }}</span>
              <span v-if="post.activity">{{ post.activity.title }}</span>
            </div>

            <div class="detail-hero-copy-card__main">
              <h1 class="detail-hero-copy-card__title">{{ post.title }}</h1>
              <p class="detail-hero-copy-card__desc">{{ post.desc }}</p>
            </div>

            <div class="detail-tag-cloud detail-tag-cloud--compact">
              <span class="tag-pill">{{ post.scene }}</span>
              <span class="tag-pill">{{ post.style }}</span>
              <span v-if="post.budget" class="tag-pill">预算 {{ post.budget }}</span>
            </div>
          </section>

          <div v-if="post.imageUrls.length > 1" class="drawer-thumb-row drawer-thumb-row--gallery">
            <button
              v-for="(image, index) in post.imageUrls"
              :key="`${post.id}-${index}`"
              :class="['drawer-thumb', activeImageIndex === index ? 'drawer-thumb--active' : '']"
              type="button"
              @click="activeImageIndex = index"
            >
              <img :src="image" :alt="`${post.title}-${index + 1}`">
            </button>
          </div>

          <section class="detail-hero-copy-card detail-hero-copy-card--after-gallery">
            <div class="meta-inline meta-inline--ink">
              <span>{{ post.coverTag }}</span>
              <span>{{ post.publishTime }}</span>
              <span v-if="post.activity">{{ post.activity.title }}</span>
            </div>

            <div class="detail-hero-copy-card__main">
              <h1 class="detail-hero-copy-card__title">{{ post.title }}</h1>
              <p class="detail-hero-copy-card__desc">{{ post.desc }}</p>
            </div>

            <div class="detail-tag-cloud detail-tag-cloud--compact">
              <span class="tag-pill">{{ post.scene }}</span>
              <span class="tag-pill">{{ post.style }}</span>
              <span v-if="post.budget" class="tag-pill">棰勭畻 {{ post.budget }}</span>
            </div>
            <div v-if="post.budget" class="detail-hero-copy-card__budget">Budget {{ post.budget }}</div>
          </section>

          <section class="drawer-block drawer-block--comments">
            <div class="drawer-block__eyebrow">Author</div>
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

            <div class="detail-actions detail-actions--polished" style="margin-top: 18px;">
              <button
                :class="['detail-action-pill', post.liked ? 'detail-action-pill--liked' : 'detail-action-pill--like']"
                type="button"
                :aria-pressed="post.liked"
                @click="handleLike"
              >
                <span class="detail-action-pill__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
                  </svg>
                </span>
                <span class="detail-action-pill__body">
                  <span class="detail-action-pill__label">{{ post.liked ? "已点赞" : "点赞" }}</span>
                  <span class="detail-action-pill__count">{{ formatCount(post.likes) }}</span>
                </span>
              </button>
              <button
                :class="['detail-action-pill', post.favorited ? 'detail-action-pill--favorited' : 'detail-action-pill--favorite']"
                type="button"
                :aria-pressed="post.favorited"
                @click="handleFavorite"
              >
                <span class="detail-action-pill__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 2.6 2.85 5.78 6.38.93-4.62 4.5 1.09 6.36L12 17.17l-5.7 3 1.09-6.36-4.62-4.5 6.38-.93z" />
                  </svg>
                </span>
                <span class="detail-action-pill__body">
                  <span class="detail-action-pill__label">{{ post.favorited ? "已收藏" : "收藏" }}</span>
                  <span class="detail-action-pill__count">{{ formatCount(post.saves) }}</span>
                </span>
              </button>
              <button
                :class="['detail-action-pill', post.followed ? 'detail-action-pill--followed' : 'detail-action-pill--follow']"
                type="button"
                :aria-pressed="post.followed"
                @click="handleFollow"
              >
                <span class="detail-action-pill__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9">
                    <path d="M15.5 19a5.5 5.5 0 0 0-11 0" />
                    <circle cx="10" cy="8.5" r="3.5" />
                    <path d="M19 8v6" />
                    <path d="M16 11h6" />
                  </svg>
                </span>
                <span class="detail-action-pill__body">
                  <span class="detail-action-pill__label">{{ post.followed ? "已关注作者" : "关注作者" }}</span>
                  <span class="detail-action-pill__count">{{ post.followed ? "已同步" : "点一下" }}</span>
                </span>
              </button>
            </div>
          </section>

          <section v-if="post.activity" class="drawer-related-card">
            <div class="drawer-block__eyebrow">Activity</div>
            <h2 class="drawer-block__title">{{ post.activity.title }}</h2>
            <p class="drawer-block__copy">{{ post.activity.summary || post.activity.progressText }}</p>
            <div class="button-row">
              <button class="outline-button" type="button" @click="openActivity(post.activity.id)">查看活动详情</button>
            </div>
          </section>
        </div>

        <aside class="list-stack">
          <section class="drawer-block">
            <div class="drawer-block__eyebrow">Info</div>
            <h2 class="drawer-block__title">内容信息</h2>
            <div class="detail-kpis">
              <div class="detail-kpi">
                <strong>点赞</strong>
                <span>{{ formatCount(post.likes) }}</span>
              </div>
              <div class="detail-kpi">
                <strong>评论</strong>
                <span>{{ formatCount(post.comments) }}</span>
              </div>
              <div class="detail-kpi">
                <strong>收藏</strong>
                <span>{{ formatCount(post.saves) }}</span>
              </div>
            </div>
            <div class="detail-tag-cloud" style="margin-top: 16px;">
              <span class="tag-pill">{{ post.scene }}</span>
              <span class="tag-pill">{{ post.style }}</span>
              <span v-if="post.budget" class="tag-pill">预算 {{ post.budget }}</span>
            </div>
            <p v-if="post.product || post.price" class="detail-note">
              {{ post.product || "商品信息" }}<span v-if="post.price"> · {{ post.price }}</span>
            </p>
            <button
              v-if="post.productLink"
              class="outline-button"
              type="button"
              @click="openProductLink"
            >
              打开商品链接
            </button>
          </section>

          <section class="drawer-block">
            <div class="drawer-block__eyebrow">Comment</div>
            <h2 class="drawer-block__title">评论区</h2>

            <div class="drawer-comment-form">
              <div v-if="replyTarget" class="comment-reply-banner">
                <span>正在回复 {{ replyTarget.name }}</span>
                <button class="small-link" type="button" @click="clearReplyTarget">取消回复</button>
              </div>
              <textarea
                ref="commentInput"
                v-model="commentText"
                class="text-area"
                :placeholder="commentPlaceholder"
              ></textarea>
              <div class="comment-input-actions">
                <span class="helper-inline">共 {{ commentCount }} 条评论</span>
                <button class="primary-button" type="button" @click="submitCommentAction">
                  {{ replyTarget ? "发送回复" : "发送评论" }}
                </button>
              </div>
            </div>

            <div v-if="comments.length" class="drawer-comment-list">
              <article v-for="comment in comments" :key="comment.id" class="comment-card">
                <div class="comment-card__avatar">
                  <img v-if="comment.avatarUrl" :src="comment.avatarUrl" :alt="comment.name">
                  <span v-else>{{ getInitial(comment.name, comment.avatar) }}</span>
                </div>
                <div class="comment-card__body">
                  <div class="comment-card__head">
                    <span class="comment-card__name">{{ comment.name }}</span>
                    <span class="comment-card__time">{{ comment.time }}</span>
                  </div>
                  <div class="comment-card__text">
                    <span v-if="comment.replyToName" class="comment-card__reply-prefix">回复 {{ comment.replyToName }}：</span>
                    {{ comment.text }}
                  </div>
                  <div class="comment-card__actions">
                    <button class="comment-card__action comment-card__action--reply" type="button" @click="setReplyTarget(comment)">
                      回复
                    </button>
                    <button
                      :class="['comment-card__action', 'comment-card__action--like', comment.liked ? 'comment-card__action--liked' : '']"
                      type="button"
                      :aria-pressed="comment.liked"
                      @click="toggleCommentLikeAction(comment)"
                    >
                      <span class="comment-card__action-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
                        </svg>
                      </span>
                      <span>{{ formatCount(comment.likes) }}</span>
                    </button>
                  </div>

                  <div v-if="comment.replies.length" class="comment-reply-list">
                    <article v-for="reply in comment.replies" :key="reply.id" class="comment-reply">
                      <div class="comment-card__avatar comment-card__avatar--reply">
                        <img v-if="reply.avatarUrl" :src="reply.avatarUrl" :alt="reply.name">
                        <span v-else>{{ getInitial(reply.name, reply.avatar) }}</span>
                      </div>
                      <div class="comment-card__body">
                        <div class="comment-card__head">
                          <span class="comment-card__name">{{ reply.name }}</span>
                          <span class="comment-card__time">{{ reply.time }}</span>
                        </div>
                        <div class="comment-card__text">
                          <span v-if="reply.replyToName" class="comment-card__reply-prefix">回复 {{ reply.replyToName }}：</span>
                          {{ reply.text }}
                        </div>
                        <div class="comment-card__actions">
                          <button class="comment-card__action comment-card__action--reply" type="button" @click="setReplyTarget(reply)">
                            回复
                          </button>
                          <button
                            :class="['comment-card__action', 'comment-card__action--like', reply.liked ? 'comment-card__action--liked' : '']"
                            type="button"
                            :aria-pressed="reply.liked"
                            @click="toggleCommentLikeAction(reply)"
                          >
                            <span class="comment-card__action-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
                              </svg>
                            </span>
                            <span>{{ formatCount(reply.likes) }}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="comment-empty">还没有评论，桌面端现在已经支持直接发表评论。</div>
          </section>
        </aside>
      </section>
    </template>

    <div v-else class="empty-state">
      <div class="empty-state__title">内容不存在或加载失败</div>
      <p class="empty-state__copy">{{ errorText || "请稍后重试，或从首页重新进入这条内容。" }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import { clampNumber, firstText, formatCount, getInitial, safeText } from "../utils/formatters";
import { useAppStore } from "../stores/appStore";

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const loading = ref(true);
const errorText = ref("");
const post = ref(null);
const comments = ref([]);
const commentText = ref("");
const commentInput = ref(null);
const replyTarget = ref(null);
const activeImageIndex = ref(0);

const postId = computed(() => String(route.params.id || ""));
const currentImage = computed(() => post.value?.imageUrls?.[activeImageIndex.value] || post.value?.coverUrl || "");
const commentCount = computed(() => countComments(comments.value));
const commentPlaceholder = computed(() => {
  if (replyTarget.value?.name) {
    return `回复 ${replyTarget.value.name}...`;
  }
  return "写下你的想法，评论会直接发送到后端。";
});

watch(
  postId,
  async () => {
    await loadDetail();
  },
  { immediate: true }
);

async function loadDetail() {
  loading.value = true;
  errorText.value = "";
  activeImageIndex.value = 0;
  replyTarget.value = null;

  const local = findLocalPost(postId.value);
  if (local) {
    post.value = local;
  }

  try {
    const result = await api.getPostDetail(postId.value);
    post.value = store.normalizePost(result);
  } catch (error) {
    if (!local) {
      post.value = null;
      errorText.value = error?.message || "内容加载失败";
    }
  }

  try {
    const result = await api.listComments(postId.value);
    comments.value = (Array.isArray(result) ? result : []).map(normalizeComment);
  } catch (error) {
    comments.value = [];
  } finally {
    loading.value = false;
  }
}

function findLocalPost(id) {
  const pool = [
    ...store.state.posts,
    ...store.state.myPosts,
    ...store.state.favoritePosts
  ];
  return pool.find((item) => String(item.id) === String(id)) || null;
}

function normalizeComment(item, index = 0) {
  const replies = Array.isArray(item?.replies)
    ? item.replies.map((reply, replyIndex) => normalizeComment(reply, replyIndex))
    : [];

  return {
    id: String(item?.id || `comment-${index}`),
    name: safeText(item?.name, item?.user, item?.nickname, "青搭用户"),
    avatar: safeText(item?.avatar, "CF"),
    avatarUrl: firstText(item?.avatarUrl),
    text: safeText(item?.text, item?.content, "暂无评论内容"),
    time: safeText(item?.time, item?.createTime, item?.publishTime, "刚刚"),
    likes: clampNumber(item?.likes || item?.likeCount),
    liked: !!item?.liked,
    mine: !!item?.mine,
    parentId: firstText(item?.parentId),
    replyToName: safeText(item?.replyToName),
    replies
  };
}

async function handleLike() {
  if (!ensureAuth()) {
    return;
  }
  try {
    const result = await api.toggleLike(postId.value);
    post.value = {
      ...post.value,
      liked: typeof result?.liked === "boolean" ? result.liked : !post.value.liked,
      likes: clampNumber(result?.likes ?? (post.value.likes + (post.value.liked ? -1 : 1)))
    };
    await refreshStoreState();
  } catch (error) {
    errorText.value = error?.message || "点赞失败";
  }
}

async function handleFavorite() {
  if (!ensureAuth()) {
    return;
  }
  try {
    const result = await api.toggleFavorite(postId.value);
    post.value = {
      ...post.value,
      favorited: typeof result?.favorited === "boolean" ? result.favorited : !post.value.favorited,
      saves: clampNumber(result?.saves ?? (post.value.saves + (post.value.favorited ? -1 : 1)))
    };
    await refreshStoreState();
  } catch (error) {
    errorText.value = error?.message || "收藏失败";
  }
}

async function handleFollow() {
  if (!ensureAuth()) {
    return;
  }
  try {
    const result = await api.toggleFollow(post.value.authorId);
    post.value = {
      ...post.value,
      followed: typeof result?.followed === "boolean" ? result.followed : !post.value.followed
    };
    await store.loadPrivateData();
  } catch (error) {
    errorText.value = error?.message || "关注失败";
  }
}

async function submitCommentAction() {
  if (!ensureAuth()) {
    return;
  }
  if (!commentText.value.trim()) {
    errorText.value = "先写一点内容再发送评论。";
    return;
  }
  try {
    await api.createComment(postId.value, {
      content: commentText.value.trim(),
      replyToCommentId: replyTarget.value?.id || ""
    });
    commentText.value = "";
    replyTarget.value = null;
    await loadComments();
  } catch (error) {
    errorText.value = error?.message || "评论发送失败";
  }
}

async function loadComments() {
  const result = await api.listComments(postId.value);
  comments.value = (Array.isArray(result) ? result : []).map(normalizeComment);
  post.value = {
    ...post.value,
    comments: countComments(comments.value)
  };
  await refreshStoreState();
}

async function toggleCommentLikeAction(comment) {
  if (!ensureAuth()) {
    return;
  }

  try {
    const result = await api.toggleCommentLike(postId.value, comment.id);
    comments.value = updateCommentTree(comments.value, comment.id, (current) => ({
      ...current,
      liked: typeof result?.active === "boolean" ? result.active : !current.liked,
      likes: clampNumber(result?.count ?? (current.likes + (current.liked ? -1 : 1)))
    }));
  } catch (error) {
    errorText.value = error?.message || "评论点赞失败";
  }
}

async function refreshStoreState() {
  await store.loadPublicData();
  if (store.isAuthed.value) {
    await store.loadPrivateData();
  }
}

function ensureAuth() {
  if (store.isAuthed.value) {
    return true;
  }
  store.openLoginDialog();
  return false;
}

function setReplyTarget(comment) {
  replyTarget.value = {
    id: comment.id,
    name: comment.name
  };
  focusCommentInput();
}

function clearReplyTarget() {
  replyTarget.value = null;
}

function openActivity(id) {
  router.push({ name: "activity-detail", params: { id } });
}

function openProductLink() {
  if (!post.value?.productLink) {
    return;
  }
  window.open(post.value.productLink, "_blank", "noopener");
}

function goBack() {
  router.push({ name: "home" });
}

function countComments(list) {
  return list.reduce((total, item) => total + 1 + countComments(item.replies || []), 0);
}

function updateCommentTree(list, targetId, updater) {
  return list.map((item) => {
    if (String(item.id) === String(targetId)) {
      return updater(item);
    }

    if (item.replies?.length) {
      return {
        ...item,
        replies: updateCommentTree(item.replies, targetId, updater)
      };
    }

    return item;
  });
}

function focusCommentInput() {
  if (typeof window !== "undefined") {
    window.requestAnimationFrame(() => {
      commentInput.value?.focus();
    });
  }
}
</script>

<style scoped>
.drawer-block--comments {
  overflow: hidden;
}

.gallery-stage {
  min-height: 480px;
}

.gallery-stage::after {
  display: none;
}

.gallery-stage__body {
  display: none;
}

.gallery-stage__counter {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 1;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: rgba(12, 20, 31, 0.54);
  backdrop-filter: blur(10px);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.detail-hero-copy-card {
  display: grid;
  gap: 16px;
  padding: 22px 24px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(78, 181, 255, 0.12), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 251, 255, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 40px rgba(28, 78, 125, 0.12);
}

.detail-hero-copy-card__main {
  display: grid;
  gap: 10px;
}

.detail-hero-copy-card__title {
  margin: 0;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.02;
  letter-spacing: -0.05em;
}

.detail-hero-copy-card__desc {
  margin: 0;
  color: var(--muted-strong);
  font-size: 15px;
  line-height: 1.9;
}

.meta-inline--ink span {
  background: rgba(20, 103, 245, 0.07);
  color: var(--muted-strong);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.detail-tag-cloud--compact {
  margin-top: -2px;
}

.detail-hero-copy-card__budget {
  color: #8a6119;
  font-size: 13px;
  font-weight: 700;
}

.detail-hero-copy-card--after-gallery .detail-tag-cloud--compact .tag-pill:nth-child(3) {
  display: none;
}

.drawer-thumb-row--gallery {
  padding-top: 2px;
}

.detail-actions--polished {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-action-pill {
  position: relative;
  min-height: 68px;
  padding: 12px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  border: 1px solid rgba(140, 166, 192, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(244, 249, 255, 0.9));
  box-shadow:
    0 12px 24px rgba(36, 83, 127, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.detail-action-pill:hover {
  transform: translateY(-1px);
  box-shadow:
    0 16px 30px rgba(36, 83, 127, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.detail-action-pill__icon {
  width: 42px;
  height: 42px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--muted-strong);
  background: rgba(96, 114, 134, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.64);
}

.detail-action-pill__icon svg {
  width: 20px;
  height: 20px;
}

.detail-action-pill__body {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.detail-action-pill__label {
  color: var(--text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.1;
}

.detail-action-pill__count {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.1;
}

.detail-action-pill--like,
.detail-action-pill--favorite,
.detail-action-pill--follow {
  color: var(--text);
}

.detail-action-pill--like .detail-action-pill__icon {
  color: #c55e75;
  background: linear-gradient(135deg, rgba(255, 228, 234, 0.96), rgba(255, 244, 247, 0.98));
}

.detail-action-pill--favorite .detail-action-pill__icon {
  color: #c08516;
  background: linear-gradient(135deg, rgba(255, 241, 199, 0.98), rgba(255, 248, 225, 0.98));
}

.detail-action-pill--follow .detail-action-pill__icon {
  color: var(--primary);
  background: linear-gradient(135deg, rgba(221, 236, 255, 0.98), rgba(236, 247, 255, 0.98));
}

.detail-action-pill--liked {
  border-color: rgba(225, 86, 119, 0.22);
  background:
    radial-gradient(circle at top right, rgba(255, 222, 230, 0.92), transparent 42%),
    linear-gradient(135deg, rgba(255, 239, 243, 0.98), rgba(255, 249, 250, 0.96));
}

.detail-action-pill--liked .detail-action-pill__icon {
  color: #ffffff;
  background: linear-gradient(135deg, #f25f86, #d93c63);
  box-shadow: 0 10px 20px rgba(217, 60, 99, 0.24);
}

.detail-action-pill--liked .detail-action-pill__label,
.detail-action-pill--liked .detail-action-pill__count {
  color: #a62f50;
}

.detail-action-pill--favorited {
  border-color: rgba(232, 168, 42, 0.24);
  background:
    radial-gradient(circle at top right, rgba(255, 244, 205, 0.96), transparent 42%),
    linear-gradient(135deg, rgba(255, 248, 226, 0.98), rgba(255, 253, 244, 0.96));
}

.detail-action-pill--favorited .detail-action-pill__icon {
  color: #ffffff;
  background: linear-gradient(135deg, #f6b545, #ef8f22);
  box-shadow: 0 10px 20px rgba(239, 143, 34, 0.24);
}

.detail-action-pill--favorited .detail-action-pill__label,
.detail-action-pill--favorited .detail-action-pill__count {
  color: #9a6511;
}

.detail-action-pill--followed {
  border-color: rgba(20, 103, 245, 0.2);
  background:
    radial-gradient(circle at top right, rgba(212, 236, 255, 0.94), transparent 44%),
    linear-gradient(135deg, rgba(239, 248, 255, 0.98), rgba(246, 252, 255, 0.94));
}

.detail-action-pill--followed .detail-action-pill__icon {
  color: #ffffff;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft) 60%, var(--accent));
  box-shadow: 0 10px 20px rgba(20, 103, 245, 0.22);
}

.detail-action-pill--followed .detail-action-pill__label,
.detail-action-pill--followed .detail-action-pill__count {
  color: #1858bd;
}

.comment-reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(20, 103, 245, 0.08);
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
}

.comment-card__reply-prefix {
  color: var(--primary);
  font-weight: 700;
}

.comment-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.comment-card__action {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted-strong);
  background: rgba(244, 248, 253, 0.94);
  border: 1px solid rgba(144, 177, 203, 0.18);
  font-size: 12px;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.comment-card__action--reply {
  color: var(--primary);
  background: rgba(20, 103, 245, 0.08);
  border-color: rgba(20, 103, 245, 0.08);
}

.comment-card__action--like {
  min-width: 58px;
  justify-content: center;
}

.comment-card__action-icon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.comment-card__action-icon svg {
  width: 14px;
  height: 14px;
}

.comment-card__action--liked {
  color: #cf3d61;
  background: linear-gradient(135deg, rgba(255, 233, 239, 0.98), rgba(255, 245, 247, 0.98));
  border-color: rgba(225, 86, 119, 0.2);
  box-shadow: 0 10px 18px rgba(217, 60, 99, 0.12);
}

.comment-reply-list {
  display: grid;
  gap: 10px;
  margin-top: 2px;
}

.comment-reply {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(245, 249, 253, 0.92);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.comment-card__avatar--reply {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  font-size: 12px;
}

:deep(.drawer-comment-list) {
  max-height: 560px;
  overflow-y: auto;
  padding-right: 6px;
}

:deep(.drawer-comment-list::-webkit-scrollbar) {
  width: 8px;
}

:deep(.drawer-comment-list::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: rgba(20, 103, 245, 0.18);
}

@media (max-width: 900px) {
  .gallery-stage {
    min-height: 360px;
  }

  .detail-actions--polished {
    grid-template-columns: 1fr;
  }
}
</style>
