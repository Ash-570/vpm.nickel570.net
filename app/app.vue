<script setup>
import { ref, onMounted } from 'vue'

const repoInfo = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/repo')
    repoInfo.value = await res.json()
  } catch (e) {
    error.value = 'Failed to load repository data.'
    console.error(e)
  }
})

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard!')
}
</script>

<template>
  <div class="app-container">
    <div class="background-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <main class="content">
      <header class="glass-panel text-center hero">
        <h1 class="gradient-text">{{ repoInfo?.name || 'VPM Repository' }}</h1>
        <p class="subtitle">By {{ repoInfo?.author || 'Unknown' }}</p>
        
        <div class="repo-url-box" v-if="repoInfo?.url">
          <code>{{ repoInfo.url }}</code>
          <div class="action-buttons">
            <button @click="copyToClipboard(repoInfo.url)" class="btn-primary">
              Copy URL
            </button>
            <a :href="`vcc://vpm/addRepo?url=${encodeURIComponent(repoInfo.url)}`" class="btn-secondary">
              Add to VCC / ALCOM
            </a>
          </div>
        </div>
      </header>

      <div v-if="error" class="glass-panel error">{{ error }}</div>

      <div v-else-if="!repoInfo" class="glass-panel loading">
        <div class="spinner"></div>
        <p>Loading packages...</p>
      </div>

      <div v-else class="packages-grid">
        <div v-for="(pkgData, pkgId) in repoInfo.packages" :key="pkgId" class="glass-panel package-card">
          <div class="pkg-header">
            <h2 class="pkg-name">{{ pkgData.versions[Object.keys(pkgData.versions)[0]]?.displayName || pkgId }}</h2>
            <span class="badge">{{ pkgId }}</span>
          </div>
          <p class="pkg-desc">{{ pkgData.versions[Object.keys(pkgData.versions)[0]]?.description }}</p>
          
          <div class="versions-list">
            <h3>Versions</h3>
            <div v-for="(verData, ver) in pkgData.versions" :key="ver" class="version-item">
              <span class="version-badge">v{{ ver }}</span>
              <div class="version-stats">
                <span class="download-count">⬇ {{ verData._stats?.downloads || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Outfit:wght@500;700&display=swap');

:root {
  --bg-color: #0f172a;
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent-1: #3b82f6;
  --accent-2: #8b5cf6;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
}

.background-orbs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out alternate;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--accent-1);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: var(--accent-2);
  bottom: -200px;
  right: -100px;
  animation-delay: -10s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, 50px) scale(1.1); }
}

.content {
  max-width: 1000px;
  margin: 0 auto;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.hero {
  margin-bottom: 3rem;
  animation: slideDown 0.8s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-center { text-align: center; }

.gradient-text {
  font-family: 'Outfit', sans-serif;
  font-size: 3rem;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.repo-url-box {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0,0,0,0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 99px;
  border: 1px solid var(--glass-border);
  flex-wrap: wrap;
  justify-content: center;
}

code {
  font-family: monospace;
  color: #a78bfa;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid var(--glass-border);
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.package-card {
  transition: transform 0.3s;
  animation: fadeIn 0.8s ease-out backwards;
}

.package-card:nth-child(1) { animation-delay: 0.1s; }
.package-card:nth-child(2) { animation-delay: 0.2s; }
.package-card:nth-child(3) { animation-delay: 0.3s; }

.package-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pkg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.pkg-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  color: white;
}

.badge {
  background: rgba(255,255,255,0.1);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--text-muted);
  word-break: break-all;
}

.pkg-desc {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.versions-list h3 {
  font-size: 1rem;
  color: white;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.version-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.download-count {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.1);
  border-left-color: var(--accent-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.loading { text-align: center; }
</style>
