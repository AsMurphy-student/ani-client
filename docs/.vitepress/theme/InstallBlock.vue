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

function _select(index: number) {
  active.value = index;
}

function _copy(event: Event) {
  event.stopPropagation();
  navigator.clipboard.writeText(currentCmd.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1800);
}
</script>

<template>
  <div class="install-block">
    <div class="header">
      <div class="dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <span class="label">Install</span>
    </div>

    <div class="tabs" role="tablist" aria-label="Package manager">
      <button
        v-for="(m, i) in managers"
        :key="m.name"
        :class="['tab', { active: active === i }]"
        role="tab"
        :aria-selected="active === i"
        @click="_select(i)"
      >
        {{ m.name }}
      </button>
    </div>

    <div class="code-row">
      <span class="prompt" aria-hidden="true">$</span>
      <code>{{ currentCmd }}</code>
      <button
        class="copy-btn"
        :class="{ copied }"
        :title="copied ? 'Copied' : 'Copy to clipboard'"
        :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
        @click="_copy"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>

    <div class="footer">
      <span class="hint">Requires Node.js ≥ 20 · zero runtime deps</span>
    </div>
  </div>
</template>

<style scoped>
.install-block {
  position: relative;
  z-index: 10;
  pointer-events: auto;
  width: 100%;
  max-width: 440px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 28px -8px rgba(15, 23, 42, 0.12);
  font-family: var(--vp-font-family-base);
}

.dark .install-block {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 12px 28px -8px rgba(0, 0, 0, 0.5);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dots {
  display: flex;
  gap: 6px;
}

.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

.dots span:nth-child(1) { background: #ff5f57; }
.dots span:nth-child(2) { background: #febc2e; }
.dots span:nth-child(3) { background: #28c840; }

.label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.tabs {
  display: flex;
  padding: 6px 6px 0;
  gap: 2px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tab {
  flex: 1;
  padding: 8px 0;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--vp-font-family-base);
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: color 150ms ease, background-color 150ms ease;
}

.tab:hover {
  color: var(--vp-c-text-1);
}

.tab.active {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: var(--ac-brand-500, #02a9ff);
  border-radius: 2px 2px 0 0;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px;
  background: var(--vp-c-bg);
}

.prompt {
  color: var(--vp-c-text-3);
  user-select: none;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  font-weight: 500;
}

code {
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  color: var(--vp-c-text-1);
  flex: 1;
  background: transparent;
  padding: 0;
  border: none;
  user-select: all;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  color: var(--vp-c-text-3);
  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}

.copy-btn:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
}

.copy-btn.copied {
  color: #10b981;
}

.footer {
  padding: 8px 16px 10px;
  background: var(--vp-c-bg-alt);
  border-top: 1px solid var(--vp-c-divider);
}

.hint {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  letter-spacing: 0.01em;
}
</style>
