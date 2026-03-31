<template>
  <div class="page-shell">
    <section v-if="!store.isAuthed.value" class="login-panel">
      <div class="login-panel__title">登录后发布内容</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">登录或注册</button>
        <button class="ghost-button" type="button" @click="router.push({ name: 'home' })">先去首页看看</button>
      </div>
    </section>

    <template v-else>
      <section :class="['composer-status', statusClass]">
        <span class="composer-status__dot"></span>
        <span class="composer-status__copy">{{ statusText }}</span>
      </section>

      <section class="publish-layout">
        <aside class="publish-sidebar">
          <section class="section-panel publish-panel publish-panel--media">
            <div class="publish-panel__head">
              <div class="section-title__eyebrow">Media</div>
              <div class="publish-panel__title-row">
                <h2 class="section-title">上传图片</h2>
                <span class="publish-panel__meta">已上传 {{ successImages.length }}/{{ MAX_IMAGE_COUNT }}</span>
              </div>
              <p class="publish-panel__copy">先把封面和细节图整理好，版面会稳定很多，后面填写内容也会更顺。</p>
            </div>

            <div class="uploader-grid uploader-grid--publish">
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
                  <strong>•</strong>
                  <span>预留位</span>
                </div>
              </div>
            </div>
          </section>

          <section class="composer-summary publish-summary-card">
            <div class="publish-summary__head">
              <div class="composer-summary__title">发布摘要</div>
              <p class="composer-summary__copy">{{ summaryText }}</p>
            </div>

            <div class="publish-summary__metrics">
              <div class="publish-summary__metric">
                <strong>图片</strong>
                <span>{{ successImages.length }}</span>
              </div>
              <div class="publish-summary__metric">
                <strong>活动</strong>
                <span>{{ selectedActivity ? "已关联" : "无" }}</span>
              </div>
              <div class="publish-summary__metric">
                <strong>状态</strong>
                <span>{{ isEditingPost ? "修改中" : form.draftId ? "草稿" : "新建" }}</span>
              </div>
            </div>

            <div class="tag-row">
              <span class="tag-pill">{{ form.scene || "场景待选" }}</span>
              <span class="tag-pill">{{ form.style || "风格待选" }}</span>
              <span class="tag-pill">{{ form.budget || "预算未填" }}</span>
            </div>
          </section>
        </aside>

        <div class="publish-main">
          <section class="section-panel publish-panel">
            <div class="publish-panel__head">
              <div class="section-title__eyebrow">Basics</div>
              <h2 class="section-title">基础信息</h2>
            </div>

            <div class="publish-field-grid">
              <div class="form-group publish-field publish-field--wide">
                <div class="publish-field__head">
                  <label class="form-label" for="publish-title">标题</label>
                  <span class="publish-field__meta">{{ titleLength }}/30</span>
                </div>
                <input
                  id="publish-title"
                  v-model="form.title"
                  class="text-input"
                  type="text"
                  maxlength="30"
                  placeholder="比如：图书馆蓝白通勤穿搭"
                >
              </div>

              <div class="form-group publish-field publish-field--wide">
                <div class="publish-field__head">
                  <label class="form-label" for="publish-desc">描述</label>
                  <span class="publish-field__meta">{{ descLength }}/200</span>
                </div>
                <textarea
                  id="publish-desc"
                  v-model="form.desc"
                  class="text-area"
                  maxlength="200"
                  placeholder="写下场景、搭配思路和商品信息。"
                ></textarea>
              </div>

              <div class="inline-grid publish-inline-grid">
                <label class="inline-field">
                  <span>价格</span>
                  <input v-model="form.price" type="text" inputmode="decimal" placeholder="可选">
                </label>
                <label class="inline-field">
                  <span>链接</span>
                  <input v-model="form.link" type="url" placeholder="商品链接可选">
                </label>
              </div>
            </div>
          </section>

          <section class="section-panel publish-panel">
            <div class="publish-panel__head">
              <div class="section-title__eyebrow">Tags</div>
              <h2 class="section-title">场景与风格</h2>
              <p class="publish-panel__copy">标签不用堆太多，选准三组信息就够了，后续列表页会更整洁。</p>
            </div>

            <div class="publish-tag-stack">
              <div class="publish-tag-group">
                <div class="publish-tag-label">场景标签</div>
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

              <div class="publish-tag-group">
                <div class="publish-tag-label">风格标签</div>
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

              <div class="publish-tag-group">
                <div class="publish-tag-label">预算标签</div>
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
            </div>
          </section>

          <section class="section-panel publish-panel">
            <div class="publish-panel__head">
              <div class="section-title__eyebrow">Activity</div>
              <div class="publish-panel__title-row">
                <h2 class="section-title">发布时选择活动</h2>
                <span class="publish-panel__meta">{{ activityChoices.length }} 个可选</span>
              </div>
              <p class="publish-panel__copy">不参加活动也能直接发内容；如果要关联活动，下面选一个就好。</p>
            </div>

            <div v-if="activityChoices.length" class="publish-activity-grid">
              <button
                v-for="activity in activityChoices"
                :key="activity.id"
                :class="['publish-activity-option', selectedActivity?.id === activity.id ? 'publish-activity-option--active' : '']"
                type="button"
                @click="selectActivity(activity.id)"
              >
                <div class="publish-activity-option__top">
                  <div class="publish-activity-option__title-line">
                    <span :class="['publish-activity-option__tone', activityToneClass(activity)]"></span>
                    <strong>{{ activity.title }}</strong>
                  </div>
                  <span :class="['status-pill', activity.statusCategory === 'finished' ? 'status-pill--finished' : activity.statusCategory === 'recruiting' ? 'status-pill--recruiting' : 'status-pill--active']">
                    {{ activity.status }}
                  </span>
                </div>

                <p class="publish-activity-option__copy">{{ activity.summary }}</p>

                <div class="tag-row">
                  <span class="tag-pill">{{ activity.period }}</span>
                  <span :class="['tag-pill', { 'tag-pill--muted': !activity.selectable }]">
                    {{ activity.selectable ? "发布可选" : "发布隐藏" }}
                  </span>
                </div>
              </button>
            </div>

            <div v-else class="empty-state">
              <div class="empty-state__title">当前没有可选活动</div>
              <p class="empty-state__copy">活动管理里把活动设为“发布可选”后，这里才会显示。</p>
            </div>

            <div v-if="selectedActivity" class="helper-inline publish-helper-inline">
              已选择活动：{{ selectedActivity.title }}
              <button class="small-link" type="button" @click="selectActivity('')">取消选择</button>
            </div>
          </section>

          <section class="section-panel publish-panel">
            <div class="publish-panel__head">
              <div class="section-title__eyebrow">Cooperation</div>
              <div class="publish-panel__title-row">
                <h2 class="section-title">发布绑定合作单</h2>
                <span class="publish-panel__meta">{{ selectableCooperations.length }} 个可绑定</span>
              </div>
              <p class="publish-panel__copy">只有已确认且仍可执行的合作单会出现在这里。待确认合作请先去“我的合作”里确认，再回来绑定发布内容。</p>
            </div>

            <div v-if="selectableCooperations.length" class="publish-activity-grid">
              <button
                v-for="cooperation in selectableCooperations"
                :key="cooperation.id"
                :class="['publish-activity-option', selectedCooperation?.id === cooperation.id ? 'publish-activity-option--active' : '']"
                type="button"
                @click="selectCooperation(cooperation.id)"
              >
                <div class="publish-activity-option__top">
                  <div class="publish-activity-option__title-line">
                    <span :class="['publish-activity-option__tone', activityToneClass(cooperation)]"></span>
                    <strong>{{ cooperation.title }}</strong>
                  </div>
                  <span :class="['status-pill', cooperation.rewardIssued ? 'status-pill--finished' : cooperation.rewardReady ? 'status-pill--recruiting' : 'status-pill--active']">
                    {{ cooperation.status }}
                  </span>
                </div>

                <p class="publish-activity-option__copy">{{ cooperation.desc }}</p>

                <div class="tag-row">
                  <span class="tag-pill">{{ cooperation.merchantName }}</span>
                  <span class="tag-pill">已过 {{ cooperation.approvedPostCount }}/{{ cooperation.targetPostCount }}</span>
                </div>
              </button>
            </div>

            <div v-else class="empty-state">
              <div class="empty-state__title">{{ cooperationLoading ? "正在加载合作单..." : "当前没有可绑定合作单" }}</div>
              <p class="empty-state__copy">管理员创建合作单后，先在“我的合作”里确认，再回到发布页绑定内容。</p>
              <button class="ghost-button" type="button" @click="router.push({ name: 'cooperations' })">查看我的合作</button>
            </div>

            <div v-if="selectedCooperation" class="helper-inline publish-helper-inline">
              已选择合作单：{{ selectedCooperation.title }}
              <button class="small-link" type="button" @click="selectCooperation('')">取消绑定</button>
            </div>
          </section>

          <section class="composer-summary publish-submit-card">
            <div class="publish-submit-card__copy">
              <div class="composer-summary__title">{{ publishTitle }}</div>
              <p class="composer-summary__copy">{{ submitSummary }}</p>
            </div>

            <div class="button-row">
              <button class="secondary-button" type="button" :disabled="busy" @click="saveDraftAction">
                {{ saving ? "保存中..." : "保存草稿" }}
              </button>
              <button class="primary-button" type="button" :disabled="!isReady || busy" @click="submitAction">
                {{ submitLabel }}
              </button>
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
const loadingEditor = ref(false);
const cooperationLoading = ref(false);
const cooperationChoices = ref([]);

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
  cooperationId: "",
  draftId: "",
  postId: ""
});

const uploadingCount = computed(() => form.images.filter((item) => item.status === "uploading").length);
const failedCount = computed(() => form.images.filter((item) => item.status === "error").length);
const successImages = computed(() => form.images.filter((item) => item.status === "success" && item.url));
const busy = computed(() => saving.value || submitting.value || loadingEditor.value || uploadingCount.value > 0);
const canUploadMore = computed(() => form.images.length < MAX_IMAGE_COUNT);
const placeholderCount = computed(() => Math.max(0, 4 - form.images.length - (canUploadMore.value ? 1 : 0)));
const selectedActivity = computed(() => store.selectableActivities.value.find((item) => String(item.id) === String(form.activityId)) || null);
const activityChoices = computed(() => store.selectableActivities.value);
const selectableCooperations = computed(() => cooperationChoices.value.filter((item) => item.canPublish));
const selectedCooperation = computed(() => cooperationChoices.value.find((item) => String(item.id) === String(form.cooperationId)) || null);
const isEditingPost = computed(() => !!form.postId && !form.draftId);
const isReady = computed(() => {
  return !!(form.title.trim() && form.desc.trim() && successImages.value.length && failedCount.value === 0 && !uploadingCount.value);
});
const titleLength = computed(() => form.title.length);
const descLength = computed(() => form.desc.length);
const summaryText = computed(() => {
  if (isEditingPost.value) {
    return selectedActivity.value
      ? `当前正在修改驳回内容，重新提交后会进入“${selectedActivity.value.title}”活动审核。`
      : "当前正在修改驳回内容，重新提交后会再次进入审核。";
  }
  if (selectedActivity.value) {
    return `当前将发布到“${selectedActivity.value.title}”活动下。`;
  }
  return "当前不关联活动，也可以直接作为普通内容发布。";
});
const publishTitle = computed(() => {
  if (isEditingPost.value) {
    return "修改内容";
  }
  return form.draftId ? "继续编辑草稿" : "准备发布";
});
const submitSummary = computed(() => {
  if (isEditingPost.value) {
    return "这条内容会按驳回作品重新提交审核，审核通过后才会重新对外展示。";
  }
  return "草稿和正式发布都直连当前后端，图片上传完成后就可以直接保存或提交。";
});
const submitLabel = computed(() => {
  if (submitting.value) {
    return isEditingPost.value ? "提交中..." : "发布中...";
  }
  return isEditingPost.value ? "重新提交审核" : "立即发布";
});

const statusText = computed(() => {
  if (loadingEditor.value) {
    return "正在从后端加载内容...";
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
  if (isEditingPost.value) {
    return "当前正在修改审核未通过的内容，提交后会重新进入审核。";
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
  () => store.isAuthed.value,
  (authed) => {
    if (!authed) {
      cooperationChoices.value = [];
      form.cooperationId = "";
      return;
    }
    loadCooperations();
  },
  { immediate: true }
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
  () => route.query.cooperationId,
  (value) => {
    const nextId = String(value || "");
    if (!nextId) {
      return;
    }
    form.cooperationId = nextId;
  },
  { immediate: true }
);

watch(
  () => [String(route.query.draftId || ""), String(route.query.postId || "")],
  async ([draftId, postId]) => {
    if (draftId) {
      if (draftId !== form.draftId || form.postId) {
        await loadDraft(draftId);
      }
      return;
    }

    if (postId) {
      if (postId !== form.postId || form.draftId) {
        await loadPostForEdit(postId);
      }
      return;
    }

    if (form.draftId || form.postId) {
      resetForm();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  form.images.forEach(revokePreview);
});

function normalizeCooperation(item, index = 0) {
  const targetPostCount = Math.max(Number(item?.targetPostCount || 1), 1);
  const approvedPostCount = Math.max(Number(item?.approvedPostCount || 0), 0);
  const tones = ["mint", "blue", "green", "amber", "rose", "slate"];
  return {
    id: safeText(item?.id),
    title: safeText(item?.title, "未命名合作单"),
    merchantName: safeText(item?.merchantName, "合作品牌"),
    desc: safeText(item?.desc, "确认合作后即可在发布时绑定内容。"),
    status: safeText(item?.status, "待确认"),
    rewardAmount: item?.rewardAmount,
    targetPostCount,
    approvedPostCount,
    submittedPostCount: Math.max(Number(item?.submittedPostCount || 0), 0),
    canAccept: !!item?.canAccept,
    canPublish: !!item?.canPublish,
    rewardReady: !!item?.rewardReady,
    rewardIssued: !!item?.rewardIssued,
    progressText: safeText(item?.progressText),
    deadlineAt: safeText(item?.deadlineAt, "-"),
    tone: tones[index % tones.length]
  };
}

function selectActivity(id) {
  form.activityId = String(id || "");
}

function selectCooperation(id) {
  form.cooperationId = String(id || "");
}

async function loadCooperations() {
  if (!store.isAuthed.value) {
    cooperationChoices.value = [];
    return;
  }
  cooperationLoading.value = true;
  try {
    const result = await api.listMyCooperations();
    cooperationChoices.value = (Array.isArray(result) ? result : []).map(normalizeCooperation);
  } catch (error) {
    cooperationChoices.value = [];
  } finally {
    cooperationLoading.value = false;
  }
}

async function handleFileSelect(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  const remaining = MAX_IMAGE_COUNT - form.images.length;
  const selected = files.slice(0, remaining);

  for (const file of selected) {
    const itemId = addUploadingImage(file);

    try {
      const result = await api.uploadPostImage(file, { timeout: 30000 });
      const imageUrl = safeText(result?.url);
      updateImageItem(itemId, (current) => {
        if (!current) {
          return null;
        }

        if (current.previewUrl?.startsWith("blob:") && imageUrl) {
          URL.revokeObjectURL(current.previewUrl);
        }

        return {
          ...current,
          url: imageUrl,
          previewUrl: imageUrl || current.previewUrl,
          status: imageUrl ? "success" : "error"
        };
      });
    } catch (error) {
      updateImageItem(itemId, (current) => {
        if (!current) {
          return null;
        }

        return {
          ...current,
          status: "error"
        };
      });
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

function addUploadingImage(file) {
  const item = {
    id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    url: "",
    status: "uploading"
  };
  form.images = [...form.images, item];
  return item.id;
}

function updateImageItem(id, updater) {
  form.images = form.images.reduce((result, item) => {
    if (item.id !== id) {
      result.push(item);
      return result;
    }

    const nextItem = updater(item);
    if (nextItem) {
      result.push(nextItem);
    }
    return result;
  }, []);
}

function setRemoteImages(imageUrls, prefix) {
  form.images.forEach(revokePreview);
  form.images = (Array.isArray(imageUrls) ? imageUrls : []).filter(Boolean).map((url, index) => ({
    id: `${prefix}-${index}`,
    name: `${prefix}-${index}`,
    previewUrl: url,
    url,
    status: "success"
  }));
}

function applyRemoteContent(result) {
  form.title = safeText(result?.title);
  form.desc = safeText(result?.desc);
  form.price = result?.productPrice ? String(result.productPrice) : "";
  form.link = safeText(result?.productLink);
  form.scene = safeText(result?.tags?.[0], store.state.tagOptions.sceneTags[0], "");
  form.style = safeText(result?.tags?.[1], store.state.tagOptions.styleTags[0], "");
  form.budget = safeText(result?.tags?.[2]);
  form.activityId = safeText(result?.activity?.id, result?.activityId);
  form.cooperationId = safeText(result?.cooperation?.id, result?.cooperationId);
  setRemoteImages(result?.imageUrls, safeText(result?.id, "remote-image"));
}

function buildPayload() {
  return {
    title: form.title.trim(),
    desc: form.desc.trim(),
    imageUrls: successImages.value.map((item) => item.url),
    tags: [form.scene, form.style, form.budget || ""],
    productPrice: buildProductPrice(form.price.trim()),
    productLink: form.link.trim(),
    activityId: form.activityId || "",
    cooperationId: form.cooperationId || ""
  };
}

async function loadDraft(draftId) {
  loadingEditor.value = true;
  try {
    const result = await api.getDraftDetail(draftId);
    form.draftId = String(result?.id || draftId);
    form.postId = "";
    applyRemoteContent(result);
  } finally {
    loadingEditor.value = false;
  }
}

async function loadPostForEdit(postId) {
  loadingEditor.value = true;
  try {
    const result = await api.getPostEdit(postId);
    form.postId = String(result?.id || postId);
    form.draftId = "";
    applyRemoteContent(result);
  } finally {
    loadingEditor.value = false;
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
    form.postId = "";
    await store.loadPrivateData();

    const query = {};
    if (form.draftId) {
      query.draftId = form.draftId;
    }
    if (form.activityId) {
      query.activityId = form.activityId;
    }
    if (form.cooperationId) {
      query.cooperationId = form.cooperationId;
    }

    router.replace({
      name: "publish",
      query
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
    const result = form.draftId
      ? await api.publishDraft(form.draftId, payload)
      : isEditingPost.value
        ? await api.updatePost(form.postId, payload)
        : await api.createPost(payload);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "campusfit_profile_notice",
        (isEditingPost.value
          ? "修改已提交审核，审核通过后才会重新展示。"
          : "内容已提交审核，审核通过后才会对外展示。")
      );
    }

    resetForm();
    await store.refreshAll();
    router.push({ name: "profile", query: { tab: "posts" } });
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
  form.cooperationId = "";
  form.draftId = "";
  form.postId = "";
}

function activityToneClass(activity) {
  return `publish-activity-option__tone--${activity?.tone || "blue"}`;
}
</script>

<style scoped>
.publish-layout {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.publish-sidebar,
.publish-main {
  display: grid;
  gap: 18px;
  align-content: start;
}

.publish-sidebar {
  position: sticky;
  top: 106px;
}

.publish-panel {
  display: grid;
  gap: 20px;
}

.publish-panel--media {
  gap: 18px;
}

.publish-panel__head {
  display: grid;
  gap: 10px;
}

.publish-panel__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.publish-panel__meta {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(20, 103, 245, 0.08);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
}

.publish-panel__copy {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.75;
}

.uploader-grid--publish {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.uploader-grid--publish .upload-card {
  min-height: 0;
  aspect-ratio: 0.86;
}

.publish-summary-card {
  display: grid;
  gap: 18px;
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.12), rgba(56, 194, 163, 0.14));
}

.publish-summary__head {
  display: grid;
  gap: 10px;
}

.publish-summary__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.publish-summary__metric {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.publish-summary__metric strong {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.publish-summary__metric span {
  display: block;
  margin-top: 8px;
  color: var(--text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.publish-field-grid,
.publish-tag-stack {
  display: grid;
  gap: 18px;
}

.publish-field {
  gap: 12px;
}

.publish-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.publish-field__meta {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.publish-inline-grid {
  gap: 14px;
}

.publish-tag-group {
  display: grid;
  gap: 12px;
}

.publish-tag-label {
  color: var(--muted-strong);
  font-size: 14px;
  font-weight: 800;
}

.publish-activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.publish-activity-option {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  text-align: left;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}

.publish-activity-option:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.publish-activity-option--active {
  border-color: rgba(20, 103, 245, 0.2);
  box-shadow: 0 16px 32px rgba(20, 103, 245, 0.14);
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.08), rgba(56, 194, 163, 0.1));
}

.publish-activity-option__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.publish-activity-option__title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.publish-activity-option__title-line strong {
  color: var(--text);
  font-size: 18px;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.publish-activity-option__tone {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.publish-activity-option__tone--blue {
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.96), rgba(78, 181, 255, 0.86));
}

.publish-activity-option__tone--green {
  background: linear-gradient(135deg, rgba(14, 109, 97, 0.96), rgba(56, 194, 163, 0.88));
}

.publish-activity-option__tone--amber {
  background: linear-gradient(135deg, rgba(136, 89, 19, 0.96), rgba(243, 179, 76, 0.88));
}

.publish-activity-option__tone--slate {
  background: linear-gradient(135deg, rgba(44, 61, 82, 0.96), rgba(95, 122, 148, 0.88));
}

.publish-activity-option__tone--mint {
  background: linear-gradient(135deg, rgba(32, 113, 98, 0.96), rgba(110, 198, 185, 0.88));
}

.publish-activity-option__tone--rose {
  background: linear-gradient(135deg, rgba(146, 82, 122, 0.96), rgba(218, 146, 174, 0.86));
}

.publish-activity-option__copy {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.publish-helper-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.publish-submit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, rgba(20, 103, 245, 0.1), rgba(56, 194, 163, 0.14));
}

.publish-submit-card__copy {
  max-width: 560px;
}

@media (max-width: 1180px) {
  .publish-layout {
    grid-template-columns: 1fr;
  }

  .publish-sidebar {
    position: static;
  }
}

@media (max-width: 720px) {
  .publish-summary__metrics,
  .publish-activity-grid,
  .publish-inline-grid,
  .publish-submit-card {
    grid-template-columns: 1fr;
  }

  .uploader-grid--publish {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .publish-submit-card {
    display: grid;
  }
}
</style>
