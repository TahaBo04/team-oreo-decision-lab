import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = process.env.GITHUB_REPOSITORY?.split('/').at(-1);
const base = process.env.PAGES_BASE_PATH ||
  (repository ? repository.endsWith('.github.io') ? '/' : `/${repository}/` : '/team-oreo-decision-lab/');

export default defineConfig({
  base,
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
