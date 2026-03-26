const TOKEN_KEY = "campusfit_user_token";
const USER_KEY = "campusfit_user_info";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function getUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function saveSession(payload) {
  if (!payload) {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, payload.token || "");
  window.localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: payload.userId,
      phone: payload.phone,
      nickname: payload.nickname,
      avatarUrl: payload.avatarUrl || ""
    })
  );
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
