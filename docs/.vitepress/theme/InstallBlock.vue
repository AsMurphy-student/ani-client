<script setup lang="ts">
import { computed, ref } from "vue";

const managers = [
  { name: "pnpm", cmd: "pnpm add ani-client" },
  { name: "npm", cmd: "npm install ani-client" },
  { name: "yarn", cmd: "yarn add ani-client" },
  { name: "bun", cmd: "bun add ani-client" },
];

const active = ref(0);
const copied = ref(false);
const currentCmd = computed(() => managers[active.value]?.cmd ?? managers[0].cmd);

function select(index: number) {
  active.value = index;
}

function copy() {
  navigator.clipboard.writeText(currentCmd.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="install-block">
    <div class="tabs">
      <button
        v-for="(m, i) in managers"
        :key="m.name"
        :class="['tab', { active: active === i }]"
        @click="select(i)"
      >
        {{ m.name }}
      </button>
    </div>
    <div class="code-row" @click="copy">
      <span class="prompt">$</span>
      <code>{{ currentCmd }}</code>
      <button class="copy-btn" :title="copied ? 'Copied!' : 'Copy'">
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--vp-c-green-1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.install-block {
  position: relative;
  z-index: 10;
  pointer-events: auto;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  min-width: 320px;
  max-width: 420px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-border);
}

.tab {
  flex: 1;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--vp-font-family-base);
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft-up);
}

.tab.active {
  color: var(--vp-c-brand-1);
  box-shadow: inset 0 -2px 0 var(--vp-c-brand-1);
}

.code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.code-row:hover {
  background: var(--vp-c-bg-soft-up);
}

.prompt {
  color: var(--vp-c-text-3);
  user-select: none;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
}

code {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-1);
  flex: 1;
}

.copy-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.copy-btn:hover {
  color: var(--vp-c-text-1);
}
</style>
