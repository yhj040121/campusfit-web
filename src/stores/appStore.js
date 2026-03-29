import { computed, reactive } from "vue";
import * as api from "../api/client";
import {
  clampNumber,
  coverToneFromIndex,
  firstText,
  formatMoney,
  getInitial,
  safeText,
  statusCategoryFromText
} from "../utils/formatters";
import { clearSession, getUser, isLoggedIn, saveSession } from "../utils/session";

const state = reactive({
  bootstrapped: false,
  publicLoading: false,
  privateLoading: false,
  refreshing: false,
  apiStatus: "idle",
  errorText: "",
  announcement: null,
  featuredActivities: [],
  activities: [],
  posts: [],
  tagOptions: {
    sceneTags: ["图书馆", "早八", "社团活动", "约会", "通勤", "运动"],
    styleTags: ["学院风", "宽松休闲", "甜酷", "极简", "韩系", "清新"],
    budgetTags: ["50-100", "100-150", "150-200", "200+"]
  },
  user: null,
  profile: null,
  incentiveCenter: null,
  myPosts: [],
  likedPosts: [],
  favoritePosts: [],
  drafts: [],
  follows: [],
  followers: [],
  myActivities: [],
  messages: [],
  unreadCount: 0,
  loginDialogOpen: false,
  loginForm: {
    mode: "code",
    phone: "",
    code: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    sending: false,
    countdown: 0,
    submitting: false,
    timer: null,
    errorText: ""
  },
  refreshTick: 0
});

function normalizeActivity(item, index = 0) {
  return {
    id: String(item?.id || `activity-${index}`),
    title: safeText(item?.title, "未命名活动"),
    badge: safeText(item?.badge, "校园活动"),
    theme: safeText(item?.theme, item?.summary, "暂无活动简介。"),
    summary: safeText(item?.summary, item?.theme, "暂无活动摘要。"),
    period: safeText(item?.period, "时间待更新"),
    reward: safeText(item?.reward, "暂无奖励说明。"),
    participation: safeText(item?.participation, "暂无参与方式说明。"),
    scene: safeText(item?.scene, "校园活动"),
    status: safeText(item?.status, "进行中"),
    selectable: item?.selectable !== false,
    heat: clampNumber(item?.heat),
    entries: clampNumber(item?.entries),
    joined: !!item?.joined,
    statusCopy: safeText(item?.statusCopy, "活动状态将持续更新。"),
    progressText: safeText(item?.progressText, `热度 ${clampNumber(item?.heat)} · 已有 ${clampNumber(item?.entries)} 条内容`),
    statusCategory: statusCategoryFromText(item?.status),
    tone: coverToneFromIndex(index)
  };
}

function normalizePost(item, index = 0) {
  const imageUrls = Array.isArray(item?.imageUrls) ? item.imageUrls.filter(Boolean) : [];
  const coverUrl = firstText(item?.coverImageUrl, item?.displayCoverUrl, imageUrls[0]);
  return {
    id: String(item?.id || `post-${index}`),
    authorId: String(item?.authorId || item?.userId || index),
    title: safeText(item?.title, "未命名内容"),
    subtitle: safeText(item?.subtitle),
    desc: safeText(item?.desc, "暂无内容说明。"),
    coverTag: safeText(item?.coverTag, item?.scene, "校园穿搭"),
    coverUrl,
    imageUrls: imageUrls.length ? imageUrls : (coverUrl ? [coverUrl] : []),
    user: safeText(item?.user, "青搭用户"),
    avatar: safeText(item?.avatar, getInitial(item?.user, "青")),
    avatarUrl: firstText(item?.avatarUrl),
    avatarClass: safeText(item?.avatarClass, "soft"),
    school: safeText(item?.school, "校园用户"),
    scene: safeText(item?.scene, "校园"),
    style: safeText(item?.style, "极简"),
    budget: safeText(item?.budget),
    likes: clampNumber(item?.likes || item?.likeCount),
    comments: clampNumber(item?.comments || item?.commentCount),
    saves: clampNumber(item?.saves || item?.favoriteCount || item?.collectCount),
    shares: clampNumber(item?.shares || item?.shareCount),
    publishTime: safeText(item?.publishTime, "刚刚"),
    publishStatus: safeText(item?.publishStatus, "PUBLISHED"),
    publishStatusText: safeText(item?.publishStatusText, "已发布"),
    publishStatusDesc: safeText(item?.publishStatusDesc),
    canViewDetail: item?.canViewDetail !== false,
    canShelfDown: !!item?.canShelfDown,
    canRestore: !!item?.canRestore,
    price: safeText(item?.price),
    product: safeText(item?.product),
    productLink: firstText(item?.productLink),
    liked: !!item?.liked,
    favorited: !!item?.favorited,
    followed: !!item?.followed,
    mine: !!item?.mine,
    activity: item?.activity ? normalizeActivity(item.activity) : null,
    tone: coverToneFromIndex(index)
  };
}

function normalizeDraft(item, index = 0) {
  const tags = Array.isArray(item?.tags) ? item.tags.filter(Boolean) : [];
  return {
    id: String(item?.id || `draft-${index}`),
    title: safeText(item?.title, "未命名草稿"),
    desc: safeText(item?.desc),
    imageUrls: Array.isArray(item?.imageUrls) ? item.imageUrls.filter(Boolean) : [],
    coverUrl: firstText(item?.coverImageUrl, item?.imageUrls?.[0]),
    scene: safeText(tags[0], "图书馆"),
    style: safeText(tags[1], "学院风"),
    budget: safeText(tags[2]),
    productPrice: item?.productPrice,
    productLink: safeText(item?.productLink),
    savedAt: safeText(item?.savedAt, "刚刚保存"),
    activityId: safeText(item?.activityId)
  };
}

function normalizeProfile(item) {
  const user = getUser() || {};
  return {
    name: safeText(item?.name, user?.nickname, "青搭用户"),
    avatar: safeText(item?.avatar, getInitial(item?.name, user?.nickname || "青搭")),
    avatarUrl: firstText(item?.avatarUrl, user?.avatarUrl),
    coverImageUrl: firstText(item?.coverImageUrl),
    school: safeText(item?.school, "完善学校信息，让同校同学更快看到你"),
    gender: safeText(item?.gender),
    email: safeText(item?.email),
    locationName: safeText(item?.locationName),
    sign: safeText(item?.sign, "记录真实校园场景里的穿搭与活动内容。"),
    following: clampNumber(item?.following),
    followers: clampNumber(item?.followers),
    likes: clampNumber(item?.likes),
    cooperation: clampNumber(item?.cooperation)
  };
}

function normalizeIncentive(item) {
  return {
    totalAmount: formatMoney(item?.totalAmount || item?.availableAmount || 0),
    availableAmount: formatMoney(item?.availableAmount || 0),
    availableAmountRaw: clampNumber(item?.availableAmountRaw),
    pendingSettlementAmount: formatMoney(item?.pendingSettlementAmount || 0),
    pendingWithdrawAmount: formatMoney(item?.pendingWithdrawAmount || 0),
    withdrawnAmount: formatMoney(item?.withdrawnAmount || 0),
    settledCount: clampNumber(item?.settledCount),
    pendingCount: clampNumber(item?.pendingCount),
    canWithdraw: !!item?.canWithdraw,
    withdrawHint: safeText(item?.withdrawHint)
  };
}

function resetPrivateState() {
  state.profile = null;
  state.incentiveCenter = null;
  state.myPosts = [];
  state.likedPosts = [];
  state.favoritePosts = [];
  state.drafts = [];
  state.follows = [];
  state.followers = [];
  state.myActivities = [];
  state.messages = [];
  state.unreadCount = 0;
}

async function loadPublicData() {
  state.publicLoading = true;
  state.errorText = "";
  const results = await Promise.allSettled([
    api.getLatestAnnouncement(),
    api.listFeaturedActivities(),
    api.listActivities(),
    api.listRecommendations(),
    api.getTagOptions()
  ]);

  const hasSuccess = results.some((item) => item.status === "fulfilled");
  state.apiStatus = hasSuccess ? "connected" : "error";
  state.errorText = "";

  state.announcement = results[0].status === "fulfilled" ? results[0].value : null;
  state.featuredActivities = results[1].status === "fulfilled" ? results[1].value.map(normalizeActivity).slice(0, 2) : [];
  state.activities = results[2].status === "fulfilled" ? results[2].value.map(normalizeActivity) : [];
  if (!state.featuredActivities.length) {
    state.featuredActivities = state.activities.slice(0, 2);
  }
  state.posts = results[3].status === "fulfilled" ? results[3].value.map(normalizePost) : [];
  if (results[4].status === "fulfilled") {
    state.tagOptions = {
      sceneTags: results[4].value.sceneTags || state.tagOptions.sceneTags,
      styleTags: results[4].value.styleTags || state.tagOptions.styleTags,
      budgetTags: results[4].value.budgetTags || state.tagOptions.budgetTags
    };
  }
  state.publicLoading = false;
}

async function loadPrivateData() {
  if (!isLoggedIn()) {
    resetPrivateState();
    state.user = null;
    state.privateLoading = false;
    return;
  }

  state.privateLoading = true;
  const results = await Promise.allSettled([
    api.getCurrentUser(),
    api.getMyProfile(),
    api.getMyIncentiveCenter(),
    api.listMyPosts(),
    api.listLikedPosts(),
    api.listFavoritePosts(),
    api.listDrafts(),
    api.listFollows("following"),
    api.listFollows("fans"),
    api.listMyActivities(),
    api.getUnreadMessageCount()
  ]);

  if (results[0].status === "fulfilled") {
    state.user = {
      userId: results[0].value.userId,
      phone: results[0].value.phone,
      nickname: results[0].value.nickname,
      avatarUrl: results[0].value.avatarUrl || ""
    };
  } else {
    state.user = null;
  }
  state.profile = results[1].status === "fulfilled" ? normalizeProfile(results[1].value) : null;
  state.incentiveCenter = results[2].status === "fulfilled" ? normalizeIncentive(results[2].value) : null;
  state.myPosts = results[3].status === "fulfilled" ? results[3].value.map(normalizePost) : [];
  state.likedPosts = results[4].status === "fulfilled" ? results[4].value.map(normalizePost) : [];
  state.favoritePosts = results[5].status === "fulfilled" ? results[5].value.map(normalizePost) : [];
  state.drafts = results[6].status === "fulfilled" ? results[6].value.map(normalizeDraft) : [];
  state.follows = results[7].status === "fulfilled" ? results[7].value : [];
  state.followers = results[8].status === "fulfilled" ? results[8].value : [];
  state.myActivities = results[9].status === "fulfilled" ? results[9].value.map(normalizeActivity) : [];
  state.unreadCount = results[10].status === "fulfilled" ? clampNumber(results[10].value) : 0;
  state.privateLoading = false;
}

async function bootstrap() {
  if (state.bootstrapped) {
    return;
  }
  state.bootstrapped = true;
  await loadPublicData();
  await loadPrivateData();
}

async function refreshAll() {
  state.refreshing = true;
  await loadPublicData();
  await loadPrivateData();
  state.refreshTick += 1;
  state.refreshing = false;
}

async function sendLoginCode() {
  if (state.loginForm.sending) {
    return;
  }
  state.loginForm.errorText = "";
  state.loginForm.sending = true;
  try {
    const payload = await api.sendAuthCode(
      state.loginForm.phone,
      state.loginForm.mode === "register" ? "register" : "login"
    );
    startCountdown(payload?.retryAfterSeconds || 60);
    return payload;
  } catch (error) {
    state.loginForm.errorText = error?.message || "验证码发送失败";
    return null;
  } finally {
    state.loginForm.sending = false;
  }
}

function startCountdown(seconds) {
  if (state.loginForm.timer) {
    window.clearInterval(state.loginForm.timer);
  }
  state.loginForm.countdown = Number(seconds || 60);
  state.loginForm.timer = window.setInterval(() => {
    if (state.loginForm.countdown <= 1) {
      window.clearInterval(state.loginForm.timer);
      state.loginForm.timer = null;
      state.loginForm.countdown = 0;
      return;
    }
    state.loginForm.countdown -= 1;
  }, 1000);
}

async function loginWithCode() {
  state.loginForm.errorText = "";
  state.loginForm.submitting = true;
  try {
    const payload = await api.loginUser({
      phone: state.loginForm.phone,
      loginType: "code",
      code: state.loginForm.code
    });
    await finishAuth(payload);
    return payload;
  } catch (error) {
    state.loginForm.errorText = error?.message || "登录失败";
    return null;
  } finally {
    state.loginForm.submitting = false;
  }
}

async function loginWithPassword() {
  state.loginForm.errorText = "";
  state.loginForm.submitting = true;
  try {
    const payload = await api.loginUser({
      phone: state.loginForm.phone,
      loginType: "password",
      password: state.loginForm.password
    });
    await finishAuth(payload);
    return payload;
  } catch (error) {
    state.loginForm.errorText = error?.message || "登录失败";
    return null;
  } finally {
    state.loginForm.submitting = false;
  }
}

async function registerWithForm() {
  state.loginForm.errorText = "";
  state.loginForm.submitting = true;
  try {
    const payload = await api.registerUser({
      phone: state.loginForm.phone,
      code: state.loginForm.code,
      password: state.loginForm.password,
      confirmPassword: state.loginForm.confirmPassword,
      nickname: state.loginForm.nickname
    });
    await finishAuth(payload);
    return payload;
  } catch (error) {
    state.loginForm.errorText = error?.message || "注册失败";
    return null;
  } finally {
    state.loginForm.submitting = false;
  }
}

async function submitLoginForm() {
  if (state.loginForm.mode === "password") {
    return loginWithPassword();
  }
  if (state.loginForm.mode === "register") {
    return registerWithForm();
  }
  return loginWithCode();
}

async function finishAuth(payload) {
  saveSession(payload);
  state.user = getUser();
  resetLoginForm();
  state.loginDialogOpen = false;
  await loadPrivateData();
}

function resetLoginForm() {
  if (state.loginForm.timer) {
    window.clearInterval(state.loginForm.timer);
    state.loginForm.timer = null;
  }
  state.loginForm.mode = "code";
  state.loginForm.phone = "";
  state.loginForm.code = "";
  state.loginForm.password = "";
  state.loginForm.confirmPassword = "";
  state.loginForm.nickname = "";
  state.loginForm.countdown = 0;
  state.loginForm.sending = false;
  state.loginForm.submitting = false;
  state.loginForm.errorText = "";
}

function openLoginDialog(mode = "code") {
  state.loginForm.mode = mode;
  state.loginForm.errorText = "";
  state.loginDialogOpen = true;
}

function closeLoginDialog() {
  state.loginForm.errorText = "";
  state.loginDialogOpen = false;
}

function logout() {
  clearSession();
  state.user = null;
  resetPrivateState();
  resetLoginForm();
}

const isAuthed = computed(() => isLoggedIn());
const hasPrivateSession = computed(() => isLoggedIn() && (state.privateLoading || !!state.profile));
const followedAuthorIds = computed(() => {
  return Array.from(
    new Set(
      (state.follows || [])
        .map((item) => String(item.userId || item.id || item.targetUserId || item.followUserId || item.authorId || ""))
        .filter(Boolean)
    )
  );
});
const selectableActivities = computed(() => {
  return state.activities.filter((item) => item.selectable !== false && item.statusCategory !== "finished");
});

window.addEventListener("campusfit-auth-expired", () => {
  state.user = null;
  resetPrivateState();
  resetLoginForm();
  state.loginDialogOpen = true;
});

export function useAppStore() {
  return {
    state,
    isAuthed,
    hasPrivateSession,
    followedAuthorIds,
    selectableActivities,
    bootstrap,
    refreshAll,
    loadPublicData,
    loadPrivateData,
    openLoginDialog,
    closeLoginDialog,
    sendLoginCode,
    submitLoginForm,
    loginWithCode,
    loginWithPassword,
    registerWithForm,
    logout,
    normalizeActivity,
    normalizePost,
    normalizeDraft
  };
}

