<template>
  <div v-if="open" class="dialog-layer action-dialog-layer" @click.self="emit('cancel')">
    <div :class="['dialog-card', 'action-dialog', tone === 'danger' ? 'action-dialog--danger' : '']" role="alertdialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="action-dialog__head">
        <div class="action-dialog__heading">
          <div class="panel__eyebrow action-dialog__eyebrow">{{ eyebrowText }}</div>
          <h3 :id="titleId" class="dialog-card__title action-dialog__title">{{ titleText }}</h3>
        </div>

        <button class="action-dialog__close" type="button" :aria-label="mode === 'confirm' ? '取消' : '关闭'" @click="emit('cancel')">×</button>
      </div>

      <p class="action-dialog__message">{{ message }}</p>

      <div :class="['action-dialog__actions', mode === 'alert' ? 'action-dialog__actions--single' : '']">
        <button v-if="mode === 'confirm'" class="subtle-button" type="button" @click="emit('cancel')">
          {{ cancelTextText }}
        </button>
        <button
          :class="[
            tone === 'danger'
              ? 'action-dialog__confirm action-dialog__confirm--danger'
              : 'primary-button'
          ]"
          type="button"
          @click="emit('confirm')"
        >
          {{ confirmTextText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  open: Boolean,
  mode: {
    type: String,
    default: "alert"
  },
  tone: {
    type: String,
    default: "default"
  },
  eyebrow: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  },
  message: {
    type: String,
    default: ""
  },
  confirmText: {
    type: String,
    default: ""
  },
  cancelText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["cancel", "confirm"]);

const titleId = `action-dialog-title-${Math.random().toString(36).slice(2)}`;

const eyebrowText = computed(() => {
  if (props.eyebrow) {
    return props.eyebrow;
  }
  return props.mode === "confirm" ? "Confirm" : "Notice";
});

const titleText = computed(() => {
  if (props.title) {
    return props.title;
  }
  return props.mode === "confirm" ? "请确认" : "提示";
});

const confirmTextText = computed(() => {
  if (props.confirmText) {
    return props.confirmText;
  }
  return props.mode === "confirm" ? "确认" : "知道了";
});

const cancelTextText = computed(() => {
  if (props.cancelText) {
    return props.cancelText;
  }
  return "取消";
});

function handleKeydown(event) {
  if (!props.open) {
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    emit("cancel");
  }
}

watch(
  () => props.open,
  (open) => {
    if (typeof window === "undefined") {
      return;
    }
    if (open) {
      window.addEventListener("keydown", handleKeydown);
      return;
    }
    window.removeEventListener("keydown", handleKeydown);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<style scoped>
.action-dialog-layer {
  z-index: 72;
}

.action-dialog {
  width: min(540px, 100%);
  border-radius: 34px;
  background:
    radial-gradient(circle at top right, rgba(78, 181, 255, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 251, 255, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.82);
  box-shadow: 0 30px 80px rgba(16, 34, 53, 0.2);
}

.action-dialog--danger {
  background:
    radial-gradient(circle at top right, rgba(243, 179, 76, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(255, 250, 249, 0.98), rgba(255, 244, 242, 0.94));
}

.action-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.action-dialog__heading {
  min-width: 0;
}

.action-dialog__eyebrow {
  color: var(--primary);
}

.action-dialog--danger .action-dialog__eyebrow {
  color: #c75252;
}

.action-dialog--danger .action-dialog__eyebrow::before {
  background: linear-gradient(90deg, #eb6d6d, #f3b34c);
}

.action-dialog__title {
  margin-top: 12px;
}

.action-dialog__close {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: rgba(96, 114, 134, 0.08);
  color: var(--muted-strong);
  font-size: 22px;
  line-height: 1;
  transition: transform var(--transition), background var(--transition), color var(--transition);
}

.action-dialog__close:hover {
  transform: translateY(-1px);
  background: rgba(20, 103, 245, 0.1);
  color: var(--text);
}

.action-dialog__message {
  margin: 18px 0 0;
  color: var(--muted-strong);
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
}

.action-dialog__actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.action-dialog__actions--single {
  justify-content: flex-start;
}

.action-dialog__confirm {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  transition: transform var(--transition), box-shadow var(--transition), opacity var(--transition);
}

.action-dialog__confirm--danger {
  color: #ffffff;
  background: linear-gradient(135deg, #d94b4b, #ef7c65 64%, #f3b34c);
  box-shadow: 0 16px 30px rgba(217, 75, 75, 0.26);
}

.action-dialog__confirm--danger:hover {
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .action-dialog {
    padding: 20px;
    border-radius: 28px;
  }

  .action-dialog__actions,
  .action-dialog__actions--single {
    justify-content: stretch;
  }

  .action-dialog__actions > button {
    width: 100%;
  }
}
</style>
