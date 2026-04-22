<template>
  <div class="showcase-grid">
    <a href="https://github.com/gonzyui/ani-client/pulls" target="_blank" rel="noopener noreferrer" class="showcase-card">
      <div class="card-header">
        <div class="card-title-row">
          <h3>Want your projects to appear ?</h3>
          <span class="version-badge">1.X.X</span>
        </div>
      </div>

      <div class="card-body">
        <p>Open a pull request to get your projects listed here!</p>
      </div>

      <div class="card-footer">
        <div class="author">
          <img src="https://github.com/gonzyui.png" alt="gonzyui" class="author-avatar" />
          <span>By <strong>@gonzyui</strong></span>
        </div>

        <span class="visit-link">Open a PR →</span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.showcase-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background-color: var(--vp-c-bg-soft);
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.showcase-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft-up);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -2px rgb(0 0 0 / 5%);
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.3rem;
  font-weight: 700;
  transition: color 0.25s ease;
}

.showcase-card:hover .card-header h3 {
  color: var(--vp-c-brand-1);
}

.version-badge {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background-color: var(--vp-c-brand-dimm);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
}

.card-body {
  margin-top: 1rem;
  flex-grow: 1;
}

.card-body p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
}

.visit-link {
  transform: translateX(-10px);
  opacity: 0;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.showcase-card:hover .visit-link {
  transform: translateX(0);
  opacity: 1;
}

@media (width <= 640px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .card-title-row,
  .card-footer {
    gap: 0.75rem;
    align-items: flex-start;
    flex-direction: column;
  }

  .visit-link {
    transform: none;
    opacity: 1;
  }
}
</style>
