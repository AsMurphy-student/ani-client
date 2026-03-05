import { inject } from "@vercel/analytics";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import InstallBlock from "./InstallBlock.vue";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image": () => h(InstallBlock),
    });
  },
  enhanceApp() {
    if (typeof window !== "undefined") {
      inject();
    }
  },
} satisfies Theme;
