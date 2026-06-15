import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app is served from /xv/; elsewhere (Vercel, custom
// domain, local dev) it's served from the root.
const base = process.env.GITHUB_PAGES ? '/xv/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
