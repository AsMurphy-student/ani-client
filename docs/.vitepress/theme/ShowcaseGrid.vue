<script setup>
// biome-ignore lint: ignore
const projects = [
  {
    title: "Seiyuu Tree",
    subtitle: "声の木",
    description:
      "Visual seiyuu relationship tree. Explore the connections between anime characters and their Japanese voice actors.",
    url: "https://seiyuu-tree.vercel.app/",
    version: "2.0.2",
    author: "gonzyui",
    avatar: "https://github.com/gonzyui.png",
  },
];
</script>

<template>
  <div class="showcase-grid">
    <a
      v-for="project in projects"
      :key="project.title"
      :href="project.url"
      target="_blank"
      rel="noopener noreferrer"
      class="showcase-card"
    >
      <div class="card-head">
        <div class="title-block">
          <h3>{{ project.title }}</h3>
          <span v-if="project.subtitle" class="subtitle">{{ project.subtitle }}</span>
        </div>
        <span class="version-badge">v{{ project.version }}</span>
      </div>

      <p class="description">{{ project.description }}</p>

      <div class="card-foot">
        <div class="author">
          <img :src="project.avatar" :alt="project.author" class="author-avatar" />
          <span class="author-name">@{{ project.author }}</span>
        </div>
        <span class="arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
      </div>
    </a>

    <a
      href="https://github.com/gonzyui/ani-client/pulls"
      target="_blank"
      rel="noopener noreferrer"
      class="showcase-card is-cta"
    >
      <div class="card-head">
        <div class="title-block">
          <h3>Built something with ani-client?</h3>
        </div>
      </div>

      <p class="description">
        Get your project featured here. Open a pull request with a short description and a link — that's it.
      </p>

      <div class="card-foot">
        <span class="cta-text">Submit via pull request</span>
        <span class="arrow" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.showcase-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 22px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background-color 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.showcase-card:hover {
  border-color: var(--ac-brand-400, #38bdff);
  background-color: var(--vp-c-bg-soft);
  transform: translateY(-1px);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title-block {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.card-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}

.subtitle {
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-weight: 400;
  letter-spacing: -0.005em;
}

.version-badge {
  flex-shrink: 0;
  padding: 3px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
  letter-spacing: -0.01em;
}

.description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex-grow: 1;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.author-name {
  color: var(--vp-c-text-2);
  font-weight: 500;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cta-text {
  color: var(--vp-c-text-2);
  font-weight: 500;
  font-size: 13px;
}

.arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: var(--vp-c-text-3);
  transition: color 180ms ease, transform 180ms ease;
}

.showcase-card:hover .arrow {
  color: var(--ac-brand-500, #02a9ff);
  transform: translate(2px, -2px);
}

.is-cta {
  border-style: dashed;
  background-color: transparent;
}

.is-cta .card-head h3 {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.is-cta:hover .card-head h3 {
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}
</style>
