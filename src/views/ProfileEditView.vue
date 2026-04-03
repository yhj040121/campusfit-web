<template>
  <div class="page-shell">
    <section v-if="store.state.privateLoading && !loadedOnce" class="section-panel">
      <div class="section-title__eyebrow">Profile</div>
      <h2 class="section-title">正在加载资料</h2>
      <p class="section-copy">稍等一下，我们先把你当前的头像、学校和签名信息取回来。</p>
    </section>

    <section v-else-if="!store.hasPrivateSession.value" class="login-panel">
      <div class="login-panel__title">登录后修改个人资料</div>
      <p class="login-panel__copy">头像、封面和个人介绍都会同步到你的主页，先登录后再继续。</p>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
        <button class="ghost-button" type="button" @click="router.push({ name: 'profile' })">返回我的</button>
      </div>
    </section>

    <template v-else>
      <section :class="['composer-status', statusTone]">
        <span class="composer-status__dot"></span>
        <span class="composer-status__copy">{{ statusText }}</span>
      </section>

      <div class="detail-stack">
        <section class="profile-edit-hero">
          <div v-if="coverPreviewUrl" class="profile-edit-hero__cover">
            <img :src="coverPreviewUrl" :alt="form.nickname || 'profile cover'">
          </div>
          <div class="profile-edit-hero__overlay"></div>

          <div class="profile-edit-hero__body">
            <div class="profile-edit-hero__main">
              <button class="profile-edit-avatar" type="button" @click="openAvatarPicker">
                <img v-if="form.avatarUrl" :src="form.avatarUrl" :alt="form.nickname || 'avatar'">
                <span v-else>{{ avatarText }}</span>
              </button>

              <div class="profile-edit-hero__copy">
                <div class="section-title__eyebrow section-title__eyebrow--light">Profile</div>
                <h2>{{ form.nickname || "完善你的个人资料" }}</h2>
                <p>{{ profileMetaText }}</p>
              </div>
            </div>

            <div class="button-row profile-edit-hero__actions">
              <button class="ghost-button profile-edit-hero__button" type="button" @click="openAvatarPicker">
                {{ avatarUploading ? "头像上传中..." : "更换头像" }}
              </button>
              <button class="ghost-button profile-edit-hero__button" type="button" @click="openCoverPicker">
                {{ coverUploading ? "封面上传中..." : "更换封面" }}
              </button>
            </div>
          </div>

          <input ref="avatarInput" class="profile-edit-file-input" type="file" accept="image/*" @change="handleAvatarChange">
          <input ref="coverInput" class="profile-edit-file-input" type="file" accept="image/*" @change="handleCoverChange">
        </section>

        <section class="section-panel profile-edit-panel">
          <div class="section-head">
            <div class="section-head__main">
              <div class="section-title__eyebrow">Basics</div>
              <h2 class="section-title">基础信息</h2>
            </div>
          </div>

          <div class="profile-edit-grid">
            <label class="form-group profile-edit-grid__wide">
              <span class="form-label">昵称</span>
              <input v-model="form.nickname" class="text-input" type="text" maxlength="20" placeholder="给自己起一个更好记的名字">
            </label>

            <label class="form-group">
              <span class="form-label">手机号</span>
              <input :value="form.phone" class="text-input text-input--readonly" type="text" readonly>
            </label>

            <label class="form-group">
              <span class="form-label">邮箱</span>
              <input v-model="form.email" class="text-input" type="email" maxlength="120" placeholder="填写常用邮箱">
            </label>

            <div class="form-group profile-edit-grid__wide">
              <span class="form-label">性别</span>
              <div class="profile-edit-chip-row">
                <button
                  v-for="item in genderOptions"
                  :key="item.value"
                  :class="['select-chip', form.gender === item.value ? 'select-chip--active' : '']"
                  type="button"
                  @click="form.gender = form.gender === item.value ? '' : item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="section-panel profile-edit-panel">
          <div class="section-head">
            <div class="section-head__main">
              <div class="section-title__eyebrow">青搭</div>
              <h2 class="section-title">校园信息</h2>
            </div>
          </div>

          <div class="profile-edit-grid">
            <label class="form-group profile-edit-grid__wide">
              <span class="form-label">学校</span>
              <input v-model="form.schoolName" class="text-input" type="text" maxlength="100" placeholder="例如：浙江农林大学">
            </label>

            <label class="form-group">
              <span class="form-label">年级</span>
              <input v-model="form.gradeName" class="text-input" type="text" maxlength="50" placeholder="例如：大四">
            </label>

            <label class="form-group">
              <span class="form-label">居住地</span>
              <input v-model="form.locationName" class="text-input" type="text" maxlength="100" placeholder="例如：杭州 · 临安">
            </label>
          </div>
        </section>

        <section class="section-panel profile-edit-panel">
          <div class="section-head">
            <div class="section-head__main">
              <div class="section-title__eyebrow">Signature</div>
              <h2 class="section-title">个性签名</h2>
            </div>
            <span class="profile-edit-counter">{{ signatureLength }}/255</span>
          </div>

          <label class="form-group">
            <span class="form-label">一句话介绍自己</span>
            <textarea
              v-model="form.signature"
              class="text-area"
              maxlength="255"
              placeholder="写下你的穿搭偏好、运动日常，或者想让别人记住的样子。"
            ></textarea>
          </label>
        </section>

        <section class="section-panel profile-edit-panel">
          <div class="button-row profile-edit-actions">
            <button class="primary-button" type="button" :disabled="submitDisabled" @click="saveProfile">
              {{ saving ? "保存中..." : "保存资料" }}
            </button>
            <button class="ghost-button" type="button" @click="router.push({ name: 'profile' })">返回我的</button>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as api from "../api/client";
import { useAppStore } from "../stores/appStore";
import { getInitial } from "../utils/formatters";

const router = useRouter();
const store = useAppStore();

const avatarInput = ref(null);
const coverInput = ref(null);
const loading = ref(false);
const loadedOnce = ref(false);
const saving = ref(false);
const avatarUploading = ref(false);
const coverUploading = ref(false);
const statusText = ref("正在加载资料...");

const genderOptions = [
  { value: "male", label: "男生" },
  { value: "female", label: "女生" }
];

const form = reactive({
  phone: "",
  nickname: "",
  avatarUrl: "",
  coverImageUrl: "",
  gender: "",
  email: "",
  locationName: "",
  schoolName: "",
  gradeName: "",
  signature: ""
});

const avatarText = computed(() => getInitial(form.nickname || store.state.profile?.name, "青"));
const coverPreviewUrl = computed(() => form.coverImageUrl || store.state.profile?.coverImageUrl || "");
const signatureLength = computed(() => String(form.signature || "").length);
const submitDisabled = computed(() => loading.value || saving.value || avatarUploading.value || coverUploading.value);
const profileMetaText = computed(() => {
  const meta = [form.schoolName, form.gradeName, form.locationName].filter(Boolean);
  if (!meta.length) {
    return "补全学校、年级和个性签名后，主页会更完整。";
  }
  return meta.join(" · ");
});
const statusTone = computed(() => {
  if (saving.value || avatarUploading.value || coverUploading.value || loading.value) {
    return "composer-status--busy";
  }
  return "composer-status--ready";
});

onMounted(() => {
  if (store.hasPrivateSession.value) {
    loadForm();
  }
});

watch(
  () => store.hasPrivateSession.value,
  (value) => {
    if (value && !loadedOnce.value) {
      loadForm();
    }
  }
);

function normalizeGender(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["male", "男", "男生"].includes(normalized)) {
    return "male";
  }
  if (["female", "女", "女生"].includes(normalized)) {
    return "female";
  }
  return "";
}

function buildPayload() {
  return {
    nickname: String(form.nickname || "").trim(),
    avatarUrl: String(form.avatarUrl || "").trim(),
    coverImageUrl: String(form.coverImageUrl || "").trim(),
    gender: normalizeGender(form.gender),
    email: String(form.email || "").trim(),
    locationName: String(form.locationName || "").trim(),
    schoolName: String(form.schoolName || "").trim(),
    gradeName: String(form.gradeName || "").trim(),
    signature: String(form.signature || "").trim()
  };
}

function isValidEmail(value) {
  if (!value) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function loadForm() {
  loading.value = true;
  statusText.value = "正在加载资料...";

  try {
    const data = await api.getMyProfileForEdit();
    form.phone = String(data?.phone || "");
    form.nickname = String(data?.nickname || "");
    form.avatarUrl = String(data?.avatarUrl || "");
    form.coverImageUrl = String(data?.coverImageUrl || "");
    form.gender = normalizeGender(data?.gender);
    form.email = String(data?.email || "");
    form.locationName = String(data?.locationName || "");
    form.schoolName = String(data?.schoolName || "");
    form.gradeName = String(data?.gradeName || "");
    form.signature = String(data?.signature || "");
    loadedOnce.value = true;
    statusText.value = "资料已加载，可以直接修改并保存。";
  } catch (error) {
    statusText.value = error?.message || "资料加载失败，请稍后重试。";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (submitDisabled.value) {
    return;
  }

  const payload = buildPayload();

  if (!payload.nickname) {
    statusText.value = "请先填写昵称。";
    return;
  }

  if (!isValidEmail(payload.email)) {
    statusText.value = "邮箱格式不正确，请检查后再保存。";
    return;
  }

  saving.value = true;
  statusText.value = "正在保存资料...";

  try {
    await api.updateMyProfile(payload);
    await store.loadPrivateData();
    statusText.value = "资料已保存，个人主页已同步更新。";
  } catch (error) {
    statusText.value = error?.message || "资料保存失败，请稍后重试。";
  } finally {
    saving.value = false;
  }
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) {
    return;
  }

  avatarUploading.value = true;
  statusText.value = "正在上传头像...";

  try {
    const result = await api.uploadAvatar(file);
    form.avatarUrl = result?.url || "";
    statusText.value = "头像已上传，记得保存资料。";
  } catch (error) {
    statusText.value = error?.message || "头像上传失败，请稍后重试。";
  } finally {
    avatarUploading.value = false;
  }
}

function openAvatarPicker() {
  avatarInput.value?.click();
}

function openCoverPicker() {
  coverInput.value?.click();
}

async function handleCoverChange(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) {
    return;
  }

  coverUploading.value = true;
  statusText.value = "正在上传封面...";

  try {
    const result = await api.uploadProfileCover(file);
    form.coverImageUrl = result?.url || "";
    statusText.value = "封面已上传，记得保存资料。";
  } catch (error) {
    statusText.value = error?.message || "封面上传失败，请稍后重试。";
  } finally {
    coverUploading.value = false;
  }
}
</script>

<style scoped>
.profile-edit-hero {
  position: relative;
  overflow: hidden;
  border-radius: 34px;
  background: linear-gradient(155deg, rgba(20, 103, 245, 0.92), rgba(78, 181, 255, 0.82), rgba(56, 194, 163, 0.76));
  box-shadow: var(--shadow-lg);
}

.profile-edit-hero__cover {
  position: absolute;
  inset: 0;
}

.profile-edit-hero__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-edit-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 28%),
    linear-gradient(180deg, rgba(15, 25, 35, 0.08), rgba(15, 25, 35, 0.46));
}

.profile-edit-hero__body {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 20px;
  padding: 28px;
  color: #ffffff;
}

.profile-edit-hero__main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-edit-avatar {
  width: 88px;
  height: 88px;
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 18px 30px rgba(11, 24, 37, 0.18);
  color: #ffffff;
  font-size: 30px;
  font-weight: 800;
}

.profile-edit-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-edit-hero__copy {
  display: grid;
  gap: 8px;
}

.profile-edit-hero__copy h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1;
  letter-spacing: -0.05em;
}

.profile-edit-hero__copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.8;
}

.section-title__eyebrow--light {
  color: rgba(255, 255, 255, 0.88);
}

.section-title__eyebrow--light::before {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.54));
}

.profile-edit-hero__actions {
  margin-top: 4px;
}

.profile-edit-hero__button {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.26);
}

.profile-edit-file-input {
  display: none;
}

.profile-edit-panel {
  gap: 16px;
}

.profile-edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.profile-edit-grid__wide {
  grid-column: 1 / -1;
}

.text-input--readonly {
  color: var(--muted);
  background: rgba(241, 246, 251, 0.9);
}

.profile-edit-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.profile-edit-counter {
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.profile-edit-actions {
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .profile-edit-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .profile-edit-hero__main {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
