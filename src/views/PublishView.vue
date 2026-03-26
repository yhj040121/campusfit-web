<template>
  <div class="page-shell">
    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后发布内容</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">登录或注册</button>
        <button class="ghost-button" type="button" @click="router.push({ name: 'home' })">先去逛逛</button>
      </div>
    </section>

    <template v-else>
      <section :class="['composer-status', statusClass]">
        <span class="composer-status__dot"></span>
        <span class="composer-status__copy">{{ statusText }}</span>
      </section>

      <section class="composer-layout">
        <div class="composer-media">
          <section class="section-panel">
            <div class="section-head">
              <div class="section-head__main">
                <div class="section-title__eyebrow">Media</div>
                <h2 class="section-title">上传图片</h2>
              </div>
            </div>

            <div class="uploader-grid">
              <article
                v-for="image in form.images"
                :key="image.id"
                class="upload-card"
              >
                <img class="upload-card__image" :src="image.previewUrl || image.url" :alt="image.name || 'image'">
                <div class="upload-card__overlay">
                  {{ image.status === "uploading" ? "上传中..." : image.status === "error" ? "上传失败" : "已上传" }}
                </div>
                <button class="upload-card__remove" type="button" @click="removeImage(image.id)">删除</button>
              </article>

              <label v-if="canUploadMore" class="upload-card upload-card--add">
                <input type="file" multiple accept="image/*" @change="handleFileSelect">
                <div class="upload-card__label">
                  <strong>+</strong>
                  <span>添加图片</span>
                </div>
              </label>

              <div v-for="slot in placeholderCount" :key="`placeholder-${slot}`" class="upload-card upload-card--ghost">
                <div class="upload-card__label">
                  <strong>·</strong>
                  <span>预留</span>
                </div>
              </div>
            </div>
          </section>

          <section class="composer-summary">
            <div class="composer-summary__title">发布摘要</div>
            <p class="composer-summary__copy">
              {{ selectedActivity
                ? `当前将发布到“${selectedActivity.title}”活动下。`
                : "当前不关联活动，也可以直接作为普通内容发布。" }}
            </p>
            <div class="tag-row">
              <span class="tag-pill">{{ form.scene }}</span>
              <span class="tag-pill">{{ form.style }}</span>
              <span class="tag-pill">{{ form.budget || "预算未填" }}</span>
            </div>
          </section>
        </div>

        <div class="composer-form">
          <section class="section-panel">
            <div class="form-group">
              <label class="form-label" for="publish-title">标题</label>
              <input
                id="publish-title"
                v-model="form.title"
                class="text-input"
                type="text"
                maxlength="30"
                placeholder="比如：图书馆蓝白通勤穿搭"
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="publish-desc">描述</label>
              <textarea
                id="publish-desc"
                v-model="form.desc"
                class="text-area"
                maxlength="200"
                placeholder="写下场景、搭配思路和商品信息。"
              ></textarea>
            </div>

            <div class="inline-grid">
              <label class="inline-field">
                <span>价格</span>
                <input v-model="form.price" type="text" inputmode="decimal" placeholder="可选">
              </label>
              <label class="inline-field">
                <span>链接</span>
                <input v-model="form.link" type="url" placeholder="商品链接可选">
              </label>
            </div>
          </section>

          <section class="section-panel">
            <div class="section-head">
              <div class="section-head__main">
                <div class="section-title__eyebrow">Tags</div>
                <h2 class="section-title">场景与风格</h2>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">场景标签</label>
              <div class="chip-grid">
                <button
                  v-for="item in store.state.tagOptions.sceneTags"
                  :key="item"
                  :class="['select-chip', form.scene === item ? 'select-chip--active' : '']"
                  type="button"
                  @click="form.scene = item"
                >
                  {{ item }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">风格标签</label>
              <div class="chip-grid">
                <button
                  v-for="item in store.state.tagOptions.styleTags"
                  :key="item"
                  :class="['select-chip', form.style === item ? 'select-chip--active' : '']"
                  type="button"
                  @click="form.style = item"
                >
                  {{ item }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">预算标签</label>
              <div class="chip-grid">
                <button
                  :class="['select-chip', !form.budget ? 'select-chip--active' : '']"
                  type="button"
                  @click="form.budget = ''"
                >
                  不填写
                </button>
                <button
                  v-for="item in store.state.tagOptions.budgetTags"
                  :key="item"
                  :class="['select-chip', form.budget === item ? 'select-chip--active' : '']"
                  type="button"
                  @click="form.budget = item"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </section>

          <section class="section-panel">
            <div class="section-head">
              <div class="section-head__main">
                <div class="section-title__eyebrow">Activity</div>
                <h2 class="section-title">发布时选择活动</h2>
              </div>
            </div>

            <div v-if="activityChoices.length" class="activity-picker">
              <button
                v-for="activity in activityChoices"
                :key="activity.id"
                :class="['activity-mini-card', selectedActivity?.id === activity.id ? 'activity-mini-card--active' : '']"
                type="button"
                @click="selectActivity(activity.id)"
              >
                <div :class="['activity-mini-card__cover', activityToneClass(activity)]">
                  <div class="badge-list">
                    <span class="status-pill status-pill--active">{{ activity.status }}</span>
                  </div>
                </div>
                <div class="activity-mini-card__body">
                  <h3 class="draft-card__title">{{ activity.title }}</h3>
                  <p class="draft-card__copy">{{ activity.period }}</p>
                </div>
              </button>
            </div>

            <div v-else class="empty-state">
              <div class="empty-state__title">当前没有可选活动</div>
              <p class="empty-state__copy">活动管理里把活动设为“发布可选”后，这里才会显示。</p>
            </div>

            <div v-if="selectedActivity" class="helper-inline" style="margin-top: 16px;">
              已选择活动：{{ selectedActivity.title }}
              <button class="small-link" type="button" style="margin-left: 8px;" @click="selectActivity('')">
                取消选择
              </button>
            </div>
          </section>

          <section class="composer-summary">
            <div class="composer-actions">
              <div>
                <div class="composer-summary__title">{{ form.draftId ? "继续编辑草稿" : "准备发布" }}</div>
                <p class="composer-summary__copy">草稿和正式发布都直接连接当前后端，不再使用本地测试模块。</p>
              </div>

              <div class="button-row">
                <button class="secondary-button" type="button" :disabled="busy" @click="saveDraftAction">
                  {{ saving ? "保存中..." : "保存草稿" }}
                </button>
                <button class="primary-button" type="button" :disabled="!isReady || busy" @click="submitAction">
                  {{ submitting ? "发布中..." : "立即发布" }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as api from "../api/client";
import { buildProductPrice, safeText } from "../utils/formatters";
import { useAppStore } from "../stores/appStore";

const MAX_IMAGE_COUNT = 9;

const route = useRoute();
const router = useRouter();
const store = useAppStore();

const saving = ref(false);
const submitting = ref(false);
const loadingDraft = ref(false);

const form = reactive({
  title: "",
  desc: "",
  price: "",
  link: "",
  scene: "",
  style: "",
  budget: "",
  images: [],
  activityId: "",
  draftId: ""
});

const uploadingCount = computed(() => form.images.filter((item) => item.status === "uploading").length);
const failedCount = computed(() => form.images.filter((item) => item.status === "error").length);
const successImages = computed(() => form.images.filter((item) => item.status === "success" && item.url));
const busy = computed(() => saving.value || submitting.value || loadingDraft.value || uploadingCount.value > 0);
const canUploadMore = computed(() => form.images.length < MAX_IMAGE_COUNT);
const placeholderCount = computed(() => Math.max(0, 6 - form.images.length - (canUploadMore.value ? 1 : 0)));
const selectedActivity = computed(() => store.selectableActivities.value.find((item) => String(item.id) === String(form.activityId)) || null);
const activityChoices = computed(() => store.selectableActivities.value.slice(0, 6));
const isReady = computed(() => {
  return !!(form.title.trim() && form.desc.trim() && successImages.value.length && failedCount.value === 0 && !uploadingCount.value);
});

const statusText = computed(() => {
  if (loadingDraft.value) {
    return "正在从后端恢复草稿内容...";
  }
  if (uploadingCount.value) {
    return `正在上传 ${uploadingCount.value} 张图片，请稍候。`;
  }
  if (failedCount.value) {
    return `有 ${failedCount.value} 张图片上传失败，删除后再发布会更稳。`;
  }
  if (saving.value) {
    return "正在保存草稿...";
  }
  if (submitting.value) {
    return "正在提交内容...";
  }
  if (selectedActivity.value) {
    return `当前会发布到活动“${selectedActivity.value.title}”下。`;
  }
  return "当前不关联活动，也可以直接作为普通内容发布。";
});

const statusClass = computed(() => {
  if (failedCount.value) {
    return "composer-status--error";
  }
  if (busy.value) {
    return "composer-status--busy";
  }
  return isReady.value ? "composer-status--ready" : "";
});

watch(
  () => store.state.tagOptions,
  () => {
    if (!form.scene) {
      form.scene = store.state.tagOptions.sceneTags[0] || "";
    }
    if (!form.style) {
      form.style = store.state.tagOptions.styleTags[0] || "";
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => route.query.activityId,
  (value) => {
    const nextId = String(value || "");
    if (!nextId) {
      return;
    }
    const exists = store.selectableActivities.value.some((item) => String(item.id) === nextId);
    if (exists) {
      form.activityId = nextId;
    }
  },
  { immediate: true }
);

watch(
  () => route.query.draftId,
  async (value) => {
    const nextId = String(value || "");
    if (!nextId) {
      return;
    }
    await loadDraft(nextId);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  form.images.forEach(revokePreview);
});

function selectActivity(id) {
  form.activityId = String(id || "");
}

async function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  const remaining = MAX_IMAGE_COUNT - form.images.length;
  const selected = files.slice(0, remaining);

  for (const file of selected) {
    const previewUrl = URL.createObjectURL(file);
    const item = {
      id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      previewUrl,
      url: "",
      status: "uploading"
    };
    form.images.push(item);

    try {
      const result = await api.uploadPostImage(file);
      item.url = safeText(result?.url);
      item.previewUrl = item.url || previewUrl;
      item.status = item.url ? "success" : "error";
    } catch (error) {
      item.status = "error";
    }
  }
}

function removeImage(id) {
  const target = form.images.find((item) => item.id === id);
  if (target) {
    revokePreview(target);
  }
  form.images = form.images.filter((item) => item.id !== id);
}

function revokePreview(image) {
  if (image?.previewUrl && image.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

function buildPayload() {
  return {
    title: form.title.trim(),
    desc: form.desc.trim(),
    imageUrls: successImages.value.map((item) => item.url),
    tags: [form.scene, form.style, form.budget || ""],
    productPrice: buildProductPrice(form.price.trim()),
    productLink: form.link.trim(),
    activityId: form.activityId || ""
  };
}

async function loadDraft(draftId) {
  loadingDraft.value = true;
  try {
    const result = await api.getDraftDetail(draftId);
    form.title = safeText(result?.title);
    form.desc = safeText(result?.desc);
    form.price = result?.productPrice ? String(result.productPrice) : "";
    form.link = safeText(result?.productLink);
    form.scene = safeText(result?.tags?.[0], store.state.tagOptions.sceneTags[0], "");
    form.style = safeText(result?.tags?.[1], store.state.tagOptions.styleTags[0], "");
    form.budget = safeText(result?.tags?.[2]);
    form.activityId = store.selectableActivities.value.some((item) => String(item.id) === String(result?.activityId))
      ? String(result?.activityId)
      : "";
    form.draftId = String(result?.id || draftId);
    form.images.forEach(revokePreview);
    form.images = (Array.isArray(result?.imageUrls) ? result.imageUrls : []).filter(Boolean).map((url, index) => ({
      id: `draft-image-${index}`,
      name: `draft-${index}`,
      previewUrl: url,
      url,
      status: "success"
    }));
  } finally {
    loadingDraft.value = false;
  }
}

async function saveDraftAction() {
  saving.value = true;
  try {
    const payload = buildPayload();
    const result = form.draftId
      ? await api.updateDraft(form.draftId, payload)
      : await api.createDraft(payload);
    form.draftId = String(result?.id || form.draftId || "");
    await store.loadPrivateData();
    router.replace({
      name: "publish",
      query: form.draftId ? { draftId: form.draftId, activityId: form.activityId || undefined } : {}
    });
  } finally {
    saving.value = false;
  }
}

async function submitAction() {
  if (!isReady.value) {
    return;
  }
  submitting.value = true;
  try {
    const payload = buildPayload();
    if (form.draftId) {
      await api.publishDraft(form.draftId, payload);
    } else {
      await api.createPost(payload);
    }
    resetForm();
    await store.refreshAll();
    router.push({ name: "profile" });
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.images.forEach(revokePreview);
  form.title = "";
  form.desc = "";
  form.price = "";
  form.link = "";
  form.scene = store.state.tagOptions.sceneTags[0] || "";
  form.style = store.state.tagOptions.styleTags[0] || "";
  form.budget = "";
  form.images = [];
  form.activityId = "";
  form.draftId = "";
}

function activityToneClass(activity) {
  const tone = activity?.tone || "green";
  if (tone === "blue") {
    return "activity-mini-card__cover--green";
  }
  return `activity-mini-card__cover--${tone}`;
}
</script>
