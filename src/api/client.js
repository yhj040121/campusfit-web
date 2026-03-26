import http from "./http";

export function sendAuthCode(phone, scene = "login") {
  return http.post("/auth/send-code", { phone, scene });
}

export function loginUser(payload) {
  return http.post("/auth/login", payload);
}

export function registerUser(payload) {
  return http.post("/auth/register", payload);
}

export function getCurrentUser() {
  return http.get("/auth/me");
}

export function getLatestAnnouncement() {
  return http.get("/announcements/latest");
}

export function listFeaturedActivities() {
  return http.get("/activities/featured");
}

export function listActivities() {
  return http.get("/activities");
}

export function getActivityDetail(activityId) {
  return http.get(`/activities/${activityId}`);
}

export function toggleActivityJoin(activityId) {
  return http.post(`/activities/${activityId}/join-toggle`);
}

export function listRecommendations() {
  return http.get("/posts/recommendations");
}

export function searchPosts(keyword, filters = {}) {
  const query = new URLSearchParams({
    keyword: keyword || "",
    scene: filters.scene || "",
    style: filters.style || "",
    budget: filters.budget || ""
  });
  return http.get(`/posts/search?${query.toString()}`);
}

export function getPostDetail(postId) {
  return http.get(`/posts/${postId}`);
}

export function listComments(postId) {
  return http.get(`/posts/${postId}/comments`);
}

export function createComment(postId, payload) {
  return http.post(`/posts/${postId}/comments`, payload);
}

export function toggleLike(postId) {
  return http.post(`/posts/${postId}/like`);
}

export function toggleFavorite(postId) {
  return http.post(`/posts/${postId}/favorite`);
}

export function listLikeUsers(postId) {
  return http.get(`/posts/${postId}/likes`);
}

export function toggleFollow(targetUserId) {
  return http.post(`/profile/follows/${targetUserId}`);
}

export function createPost(payload) {
  return http.post("/posts", payload);
}

export function listDrafts() {
  return http.get("/drafts");
}

export function getDraftDetail(draftId) {
  return http.get(`/drafts/${draftId}`);
}

export function createDraft(payload) {
  return http.post("/drafts", payload);
}

export function updateDraft(draftId, payload) {
  return http.put(`/drafts/${draftId}`, payload);
}

export function publishDraft(draftId, payload) {
  return http.post(`/drafts/${draftId}/publish`, payload);
}

export function getMyProfile() {
  return http.get("/profile/me");
}

export function getMyIncentiveCenter() {
  return http.get("/profile/incentives");
}

export function listMyPosts() {
  return http.get("/posts/mine");
}

export function listFavoritePosts() {
  return http.get("/posts/favorites");
}

export function listFollows(type = "following") {
  return http.get(`/profile/follows?type=${encodeURIComponent(type)}`);
}

export function listMyActivities() {
  return http.get("/activities/mine");
}

export function getUnreadMessageCount() {
  return http.get("/messages/unread-count");
}

export function getTagOptions() {
  return http.get("/tags/options");
}

export async function uploadPostImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return http.post("/uploads/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}
