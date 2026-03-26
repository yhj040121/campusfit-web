export function firstText() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = arguments[index];
    if (value === null || value === undefined) {
      continue;
    }
    const text = String(value).trim();
    if (text) {
      return text;
    }
  }
  return "";
}

export function safeText(value, fallback = "") {
  const text = firstText(value);
  return text || fallback;
}

export function clampNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }
  return number;
}

export function formatCount(value) {
  const count = clampNumber(value);
  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1).replace(/\.0$/, "")}w`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(count));
}

export function formatMoney(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return "¥0.00";
  }
  return `¥${amount.toFixed(2)}`;
}

export function getInitial(value, fallback = "青") {
  const text = safeText(value, fallback);
  return text.slice(0, 2).toUpperCase();
}

export function buildProductPrice(value) {
  const text = firstText(value);
  if (!text) {
    return null;
  }
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text)) {
    return null;
  }
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Number(amount.toFixed(2));
}

export function statusCategoryFromText(statusText) {
  const text = safeText(statusText);
  if (text.includes("结束")) {
    return "finished";
  }
  if (text.includes("招募")) {
    return "recruiting";
  }
  return "active";
}

export function coverToneFromIndex(index) {
  const tones = ["blue", "green", "amber", "slate", "mint", "rose"];
  return tones[index % tones.length];
}
