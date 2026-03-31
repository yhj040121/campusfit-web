<template>
  <div class="page-shell">
    <section v-if="!hasSession" class="login-panel">
      <div class="login-panel__title">登录后查看激励与提现</div>
      <div class="button-row">
        <button class="primary-button" type="button" @click="store.openLoginDialog()">立即登录</button>
      </div>
    </section>

    <template v-else>
      <section class="incentive-hero">
        <div>
          <div class="section-title__eyebrow">Incentive</div>
          <h1 class="incentive-hero__title">激励中心</h1>
          <p class="incentive-hero__copy">{{ center.withdrawHint }}</p>
        </div>
        <div class="button-row incentive-hero__actions">
          <button class="outline-button" type="button" @click="router.push({ name: 'profile' })">返回个人中心</button>
          <button class="ghost-button" type="button" @click="router.push({ name: 'cooperations' })">我的合作</button>
        </div>
      </section>

      <section class="incentive-layout">
        <div class="incentive-main">
          <section class="section-panel">
            <div class="section-head">
              <div>
                <div class="section-title__eyebrow">Overview</div>
                <h2 class="section-title">可提现与结算概况</h2>
              </div>
            </div>

            <div class="status-metrics status-metrics--grid">
              <div class="status-metric">
                <strong>{{ center.availableAmount }}</strong>
                <span>可提现</span>
              </div>
              <div class="status-metric">
                <strong>{{ center.pendingSettlementAmount }}</strong>
                <span>待结算</span>
              </div>
              <div class="status-metric">
                <strong>{{ center.pendingWithdrawAmount }}</strong>
                <span>提现中</span>
              </div>
              <div class="status-metric">
                <strong>{{ center.withdrawnAmount }}</strong>
                <span>已提现</span>
              </div>
            </div>
          </section>

          <section class="section-panel">
            <div class="section-head">
              <div>
                <div class="section-title__eyebrow">Withdraw</div>
                <h2 class="section-title">发起提现</h2>
              </div>
              <button class="small-link small-link--soft" type="button" @click="fillMaxAmount">全部提现</button>
            </div>

            <div class="withdraw-card">
              <label class="form-group withdraw-form">
                <span class="form-label">提现金额</span>
                <input
                  v-model="withdrawAmountInput"
                  class="text-input withdraw-input"
                  type="text"
                  inputmode="decimal"
                  placeholder="输入想提现的金额"
                >
              </label>

              <div class="withdraw-meta">
                <span>最低 {{ withdrawMinAmountText }}</span>
                <span>手续费 {{ feeRatePercent }}%</span>
                <span>最多 {{ center.availableAmount }}</span>
              </div>

              <div class="withdraw-preview">
                <div class="withdraw-preview__item">
                  <strong>{{ previewAmountText }}</strong>
                  <span>申请金额</span>
                </div>
                <div class="withdraw-preview__item">
                  <strong>{{ previewFeeText }}</strong>
                  <span>平台手续费</span>
                </div>
                <div class="withdraw-preview__item">
                  <strong>{{ previewNetText }}</strong>
                  <span>预计到账</span>
                </div>
              </div>

              <p class="helper-inline">{{ withdrawValidationText }}</p>
              <p v-if="flashNotice" class="helper-inline helper-inline--success">{{ flashNotice }}</p>

              <div class="button-row">
                <button class="primary-button" type="button" :disabled="!canSubmitWithdraw" @click="submitWithdraw">
                  {{ submitting ? "提交中..." : "提交提现申请" }}
                </button>
                <button class="ghost-button" type="button" @click="reloadCenter">刷新金额</button>
              </div>
            </div>
          </section>

          <section class="section-panel">
            <div class="section-head">
              <div>
                <div class="section-title__eyebrow">Records</div>
                <h2 class="section-title">最近激励</h2>
              </div>
            </div>

            <div v-if="settlementRecords.length" class="incentive-list">
              <article
                v-for="record in settlementRecords"
                :key="record.recordId"
                class="incentive-card"
              >
                <div class="incentive-card__main">
                  <strong>{{ record.type }}</strong>
                  <p>{{ record.postTitle }}</p>
                  <span>{{ record.createdAt }}</span>
                </div>
                <div class="incentive-card__side">
                  <strong>{{ record.amount }}</strong>
                  <span :class="['incentive-card__status', record.statusCode === 1 ? 'incentive-card__status--success' : 'incentive-card__status--warning']">{{ record.status }}</span>
                  <button
                    v-if="record.postId && record.postId !== '0'"
                    class="small-link small-link--soft"
                    type="button"
                    @click="openPost(record.postId)"
                  >
                    查看内容
                  </button>
                </div>
              </article>
            </div>
            <div v-else class="comment-empty">暂无激励明细</div>
          </section>
        </div>

        <aside class="incentive-side">
          <section class="panel">
            <div class="panel__eyebrow">Progress</div>
            <h2 class="panel__title">提现进度</h2>

            <div v-if="withdrawRequests.length" class="incentive-list">
              <article
                v-for="request in withdrawRequests"
                :key="request.requestId"
                class="incentive-card incentive-card--withdraw"
              >
                <div class="incentive-card__main">
                  <strong>{{ request.amount }}</strong>
                  <p>手续费 {{ request.feeAmount }}，预计到账 {{ request.netAmount }}</p>
                  <span>{{ request.createdAt }}</span>
                </div>
                <div class="incentive-card__side">
                  <span :class="['incentive-card__status', request.statusCode === 1 ? 'incentive-card__status--success' : (request.statusCode === 2 ? 'incentive-card__status--danger' : 'incentive-card__status--warning')]">{{ request.status }}</span>
                  <span>{{ request.processedAt !== "-" ? request.processedAt : "等待处理" }}</span>
                  <span>{{ request.remark }}</span>
                </div>
              </article>
            </div>
            <div v-else class="comment-empty">暂无提现记录</div>
          </section>
        </aside>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as api from "../api/client";
import { useAppStore } from "../stores/appStore";
import { formatMoney } from "../utils/formatters";

const router = useRouter();
const store = useAppStore();

const DEFAULT_MIN_AMOUNT = 10;
const DEFAULT_FEE_RATE = 0.02;

const withdrawAmountInput = ref("");
const submitting = ref(false);
const flashNotice = ref("");

const hasSession = computed(() => store.hasPrivateSession.value);
const center = computed(() => {
  return store.state.incentiveCenter || {
    availableAmount: "¥0.00",
    availableAmountRaw: "0.00",
    pendingSettlementAmount: "¥0.00",
    pendingWithdrawAmount: "¥0.00",
    withdrawnAmount: "¥0.00",
    withdrawHint: "",
    withdrawMinAmount: "¥10.00",
    withdrawFeeRate: "0.02",
    settlementRecords: [],
    withdrawRequests: []
  };
});

const settlementRecords = computed(() => center.value.settlementRecords || []);
const withdrawRequests = computed(() => center.value.withdrawRequests || []);

const withdrawMinAmount = computed(() => {
  return parseAmount(center.value.withdrawMinAmount) || DEFAULT_MIN_AMOUNT;
});

const withdrawMinAmountText = computed(() => formatMoney(withdrawMinAmount.value));

const withdrawFeeRate = computed(() => {
  const value = Number(center.value.withdrawFeeRate || DEFAULT_FEE_RATE);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_FEE_RATE;
});

const feeRatePercent = computed(() => {
  return (withdrawFeeRate.value * 100).toFixed(withdrawFeeRate.value * 100 >= 1 ? 0 : 2).replace(/\.0$/, "");
});

const availableAmount = computed(() => parseAmount(center.value.availableAmountRaw || center.value.availableAmount));

const withdrawAmountValue = computed(() => parseAmount(withdrawAmountInput.value));

const previewFee = computed(() => {
  const amount = withdrawAmountValue.value;
  if (amount <= 0) {
    return 0;
  }
  return Number((amount * withdrawFeeRate.value).toFixed(2));
});

const previewNet = computed(() => {
  const amount = withdrawAmountValue.value;
  if (amount <= 0) {
    return 0;
  }
  return Number(Math.max(amount - previewFee.value, 0).toFixed(2));
});

const previewAmountText = computed(() => formatMoney(withdrawAmountValue.value));
const previewFeeText = computed(() => formatMoney(previewFee.value));
const previewNetText = computed(() => formatMoney(previewNet.value));

const withdrawValidationText = computed(() => {
  if (!center.value.canWithdraw) {
    return center.value.withdrawHint || `至少满 ${withdrawMinAmountText.value} 才可提现。`;
  }
  if (!withdrawAmountInput.value.trim()) {
    return `请输入提现金额，最低 ${withdrawMinAmountText.value}，平台收取 ${feeRatePercent.value}% 手续费。`;
  }
  if (withdrawAmountValue.value <= 0) {
    return "请输入正确的提现金额。";
  }
  if (withdrawAmountValue.value < withdrawMinAmount.value) {
    return `单次提现至少 ${withdrawMinAmountText.value}。`;
  }
  if (withdrawAmountValue.value > availableAmount.value) {
    return "提现金额不能超过当前可提现余额。";
  }
  return `本次申请 ${previewAmountText.value}，平台手续费 ${previewFeeText.value}，预计到账 ${previewNetText.value}。`;
});

const canSubmitWithdraw = computed(() => {
  return hasSession.value
    && center.value.canWithdraw
    && !submitting.value
    && withdrawAmountValue.value >= withdrawMinAmount.value
    && withdrawAmountValue.value <= availableAmount.value;
});

watch(hasSession, async (value) => {
  if (value && !store.state.incentiveCenter) {
    await store.loadPrivateData();
  }
}, { immediate: true });

onMounted(async () => {
  if (hasSession.value) {
    await store.loadPrivateData();
  }
});

function parseAmount(value) {
  const text = String(value || "").replace(/[^\d.]/g, "");
  if (!text) {
    return 0;
  }
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Number(amount.toFixed(2));
}

function fillMaxAmount() {
  withdrawAmountInput.value = availableAmount.value > 0 ? availableAmount.value.toFixed(2) : "";
  flashNotice.value = "";
}

async function reloadCenter() {
  flashNotice.value = "";
  await store.loadPrivateData();
}

async function submitWithdraw() {
  if (!canSubmitWithdraw.value) {
    return;
  }
  const confirmed = await store.confirmDialog({
    eyebrow: "Withdraw",
    title: "确认提现申请",
    message: `确认申请提现吗？\n申请金额：${previewAmountText.value}\n手续费：${previewFeeText.value}\n预计到账：${previewNetText.value}`,
    confirmText: "提交申请",
    cancelText: "再核对一下"
  });
  if (!confirmed) {
    return;
  }

  submitting.value = true;
  flashNotice.value = "";
  try {
    await api.requestIncentiveWithdraw(Number(withdrawAmountValue.value.toFixed(2)));
    withdrawAmountInput.value = "";
    flashNotice.value = "提现申请已提交。";
    await store.loadPrivateData();
  } catch (error) {
    flashNotice.value = error?.message || "提现申请失败，请稍后重试。";
  } finally {
    submitting.value = false;
  }
}

function openPost(postId) {
  router.push({ name: "post-detail", params: { id: postId } });
}
</script>

<style scoped>
.incentive-hero {
  padding: 28px;
  border-radius: 32px;
  display: grid;
  gap: 18px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 26%),
    linear-gradient(135deg, rgba(20, 103, 245, 0.94), rgba(56, 194, 163, 0.82));
  color: #ffffff;
  box-shadow: 0 24px 44px rgba(20, 103, 245, 0.16);
}

.incentive-hero__title {
  margin: 6px 0 0;
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.04;
}

.incentive-hero__copy {
  margin: 12px 0 0;
  max-width: 720px;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.7;
}

.incentive-hero__actions {
  justify-content: flex-start;
}

.incentive-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 380px);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.incentive-main,
.incentive-side {
  display: grid;
  gap: 18px;
}

.status-metrics--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.withdraw-card {
  display: grid;
  gap: 16px;
}

.withdraw-form {
  margin: 0;
}

.withdraw-input {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.withdraw-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.withdraw-preview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.withdraw-preview__item {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.withdraw-preview__item strong {
  display: block;
  font-size: 22px;
  line-height: 1.08;
}

.withdraw-preview__item span {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.helper-inline--success {
  color: #15803d;
}

.incentive-list {
  display: grid;
  gap: 10px;
}

.incentive-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(20, 103, 245, 0.08);
}

.incentive-card__main,
.incentive-card__side {
  display: grid;
  gap: 6px;
}

.incentive-card__main strong,
.incentive-card__side strong {
  font-size: 14px;
}

.incentive-card__main p {
  margin: 0;
  color: var(--text);
  font-size: 13px;
  line-height: 1.5;
}

.incentive-card__main span,
.incentive-card__side span {
  color: var(--muted);
  font-size: 12px;
}

.incentive-card__side {
  justify-items: end;
  text-align: right;
}

.incentive-card__status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.incentive-card__status--success {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.incentive-card__status--warning {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.incentive-card__status--danger {
  background: rgba(239, 68, 68, 0.12);
  color: #b42318;
}

@media (max-width: 1080px) {
  .incentive-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .status-metrics--grid,
  .withdraw-preview,
  .incentive-card {
    grid-template-columns: 1fr;
  }

  .incentive-card__side {
    justify-items: start;
    text-align: left;
  }
}
</style>
