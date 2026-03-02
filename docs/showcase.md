# Showcase

Discover amazing projects, applications, and tools built using `ani-client`!

If you are using `ani-client` in your own project, feel free to open a Pull Request to get it listed here!

<br>

<div class="showcase-grid">
  <!-- ani-client-web -->
  <a href="https://gonzyuidev.xyz/projects/aniclient-template" target="_blank" rel="noopener noreferrer" class="showcase-card">
    <div class="card-header">
      <div class="card-title-row">
        <h3>ani-client template</h3>
        <span class="version-badge">v1.4.4</span>
      </div>
    </div>
    <div class="card-body">
      <p>A web showcase built around the ani-client fetching package to demonstrate its power in web environments.</p>
    </div>
    <div class="card-footer">
      <div class="author">
        <img src="https://github.com/gonzyui.png" alt="gonzyui" class="author-avatar" />
        <span>By <strong>@gonzyui</strong></span>
      </div>
      <span class="visit-link">Visit &rarr;</span>
    </div>
  </a>
</div>

<style>
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.showcase-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  text-decoration: none !important;
  color: inherit !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.showcase-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft-up);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.showcase-card:hover .card-header h3 {
  color: var(--vp-c-brand-1);
}

.version-badge {
  background-color: var(--vp-c-brand-dimm);
  color: var(--vp-c-brand-1);
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid var(--vp-c-brand-1);
}

.card-body {
  margin-top: 1rem;
  flex-grow: 1;
}

.card-body p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.card-footer {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
}

.visit-link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.showcase-card:hover .visit-link {
  opacity: 1;
  transform: translateX(0);
}
</style>
