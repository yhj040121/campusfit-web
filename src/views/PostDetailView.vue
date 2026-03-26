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
            <div class="gallery-stage__overlay"></div>
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

          <div v-if="post.imageUrls.length > 1" class="drawer-thumb-row">
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

          <section class="drawer-block">
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

            <div class="detail-actions" style="margin-top: 18px;">
              <button class="primary-button" type="button" @click="handleLike">
                {{ post.liked ? "已点赞" : "点赞" }} · {{ formatCount(post.likes) }}
              </button>
              <button class="secondary-button" type="button" @click="handleFavorite">
                {{ post.favorited ? "已收藏" : "收藏" }} · {{ formatCount(post.saves) }}
              </button>
              <button class="ghost-button" type="button" @click="handleFollow">
                {{ post.followed ? "已关注作者" : "关注作者" }}
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
              <textarea
                v-model="commentText"
                class="text-area"
                placeholder="写下你的想法，评论会直接发送到后端。"
              ></textarea>
              <div class="comment-input-actions">
                <span class="helper-inline">共 {{ comments.length }} 条评论</span>
                <button class="primary-button" type="button" @click="submitCommentAction">发送评论</button>
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
                  <div class="comment-card__text">{{ comment.text }}</div>
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
const activeImageIndex = ref(0);

const postId = computed(() => String(route.params.id || ""));
const currentImage = computed(() => post.value?.imageUrls?.[activeImageIndex.value] || post.value?.coverUrl || "");

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
  return {
    id: String(item?.id || `comment-${index}`),
    name: safeText(item?.name, item?.user, item?.nickname, "青搭用户"),
    avatar: safeText(item?.avatar, "CF"),
    avatarUrl: firstText(item?.avatarUrl),
    text: safeText(item?.text, item?.content, "暂无评论内容"),
    time: safeText(item?.time, item?.createTime, item?.publishTime, "刚刚"),
    likes: clampNumber(item?.likes || item?.likeCount)
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
    await api.createComment(postId.value, { content: commentText.value.trim() });
    commentText.value = "";
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
    comments: comments.value.length
  };
  await refreshStoreState();
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
</script>
