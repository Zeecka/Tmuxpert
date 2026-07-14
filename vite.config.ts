import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Bind-mounted source in a container may not deliver inotify events reliably;
// VITE_USE_POLLING=true switches the watcher to polling so HMR still fires
// (used by docker-compose.dev.yml).
const usePolling = process.env.VITE_USE_POLLING === 'true'

// Tmuxpert is a pure static SPA (no backend). Relative base only helps the
// static build (subpath / file:// hosting); the dev server serves from '/',
// where a relative base would break HMR client URLs.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? './' : '/',
  server: {
    ...(usePolling ? { watch: { usePolling: true } } : {}),
  },
}))
