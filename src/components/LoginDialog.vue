<template>
  <div v-if="open" class="dialog-layer" @click.self="emit('close')">
    <div class="dialog-card">
      <div class="dialog-card__head">
        <div>
          <div class="panel__eyebrow">登录</div>
          <h3 class="dialog-card__title">{{ titleText }}</h3>
        </div>
        <button class="icon-button" type="button" @click="emit('close')">×</button>
      </div>

      <div class="auth-mode-switch auth-mode-switch--web">
        <button
          v-for="item in modes"
          :key="item.id"
          :class="['auth-mode-pill', mode === item.id ? 'auth-mode-pill-active' : '']"
          type="button"
          @click="mode = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="form-group">
        <label class="form-label" for="login-phone">手机号</label>
        <input
          id="login-phone"
          v-model.trim="phone"
          class="text-input"
          type="tel"
          maxlength="11"
          placeholder="请输入 11 位手机号"
        >
      </div>

      <template v-if="mode === 'code' || mode === 'register'">
        <div class="form-group">
          <label class="form-label" for="login-code">验证码</label>
          <div class="inline-actions">
            <input
              id="login-code"
              v-model.trim="code"
              class="text-input"
              type="text"
              maxlength="6"
              placeholder="请输入验证码"
            >
            <button
              class="ghost-button"
              type="button"
              :disabled="sending || countdown > 0 || !canSendCode"
              @click="emit('send-code')"
            >
              {{ countdown > 0 ? `${countdown}s` : (sending ? "发送中..." : "发送验证码") }}
            </button>
          </div>
        </div>
      </template>

      <template v-if="mode === 'password' || mode === 'register'">
        <div class="form-group">
          <label class="form-label" for="login-password">密码</label>
          <input
            id="login-password"
            v-model="password"
            class="text-input"
            type="password"
            maxlength="20"
            placeholder="请输入 6-20 位密码"
          >
        </div>
      </template>

      <template v-if="mode === 'register'">
        <div class="form-group">
          <label class="form-label" for="register-confirm-password">确认密码</label>
          <input
            id="register-confirm-password"
            v-model="confirmPassword"
            class="text-input"
            type="password"
            maxlength="20"
            placeholder="请再次输入密码"
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="register-nickname">昵称</label>
          <input
            id="register-nickname"
            v-model.trim="nickname"
            class="text-input"
            type="text"
            maxlength="20"
            placeholder="请输入昵称"
          >
        </div>
      </template>

      <p v-if="errorText" class="error-text">{{ errorText }}</p>

      <div class="button-row dialog-card__actions">
        <button class="subtle-button" type="button" @click="emit('close')">稍后再说</button>
        <button
          class="primary-button"
          type="button"
          :disabled="submitting || !canSubmit"
          @click="emit('submit')"
        >
          {{ submitting ? submittingText : submitText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  open: Boolean,
  modeValue: {
    type: String,
    default: "code"
  },
  phoneValue: {
    type: String,
    default: ""
  },
  codeValue: {
    type: String,
    default: ""
  },
  passwordValue: {
    type: String,
    default: ""
  },
  confirmPasswordValue: {
    type: String,
    default: ""
  },
  nicknameValue: {
    type: String,
    default: ""
  },
  sending: Boolean,
  submitting: Boolean,
  countdown: {
    type: Number,
    default: 0
  },
  errorText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits([
  "close",
  "send-code",
  "submit",
  "update:modeValue",
  "update:phoneValue",
  "update:codeValue",
  "update:passwordValue",
  "update:confirmPasswordValue",
  "update:nicknameValue"
]);

const modes = [
  { id: "code", label: "验证码登录" },
  { id: "password", label: "密码登录" },
  { id: "register", label: "注册" }
];

const mode = ref(props.modeValue);
const phone = ref(props.phoneValue);
const code = ref(props.codeValue);
const password = ref(props.passwordValue);
const confirmPassword = ref(props.confirmPasswordValue);
const nickname = ref(props.nicknameValue);

watch(() => props.modeValue, (value) => { mode.value = value; });
watch(() => props.phoneValue, (value) => { phone.value = value; });
watch(() => props.codeValue, (value) => { code.value = value; });
watch(() => props.passwordValue, (value) => { password.value = value; });
watch(() => props.confirmPasswordValue, (value) => { confirmPassword.value = value; });
watch(() => props.nicknameValue, (value) => { nickname.value = value; });

watch(mode, (value) => emit("update:modeValue", value));
watch(phone, (value) => emit("update:phoneValue", value));
watch(code, (value) => emit("update:codeValue", value));
watch(password, (value) => emit("update:passwordValue", value));
watch(confirmPassword, (value) => emit("update:confirmPasswordValue", value));
watch(nickname, (value) => emit("update:nicknameValue", value));

const phonePattern = /^1\d{10}$/;
const codePattern = /^\d{4,6}$/;

const canSendCode = computed(() => phonePattern.test(phone.value));

const canSubmit = computed(() => {
  if (!phonePattern.test(phone.value)) {
    return false;
  }

  if (mode.value === "password") {
    return password.value.length >= 6;
  }

  if (mode.value === "register") {
    return !!(
      codePattern.test(code.value) &&
      nickname.value.trim() &&
      password.value.length >= 6 &&
      confirmPassword.value.length >= 6 &&
      password.value === confirmPassword.value
    );
  }

  return codePattern.test(code.value);
});

const titleText = computed(() => {
  if (mode.value === "password") {
    return "手机号密码登录";
  }
  if (mode.value === "register") {
    return "注册账号";
  }
  return "手机号验证码登录";
});

const submitText = computed(() => {
  if (mode.value === "register") {
    return "注册并登录";
  }
  return "立即登录";
});

const submittingText = computed(() => {
  if (mode.value === "register") {
    return "注册中...";
  }
  return "登录中...";
});
</script>
