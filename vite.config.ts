import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    build: {
      target: 'es2022',
      minify: 'oxc' as const,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Vendor libraries
            if (id.includes('node_modules')) {
              // React core runtime
              if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // Animations
              if (id.includes('framer-motion') || id.includes('/motion/')) {
                return 'vendor-motion';
              }
              // Interactive Maps
              if (id.includes('leaflet')) {
                return 'vendor-maps';
              }
              // GitHub Octokit REST client
              if (id.includes('@octokit')) {
                return 'vendor-octokit';
              }
              // Toast notifications & Schema validation
              if (id.includes('sonner') || id.includes('zod')) {
                return 'vendor-ui-utils';
              }
              // General vendor libraries
              return 'vendor-core';
            }

            // Application code splitting
            if (id.includes('/src/pages/AdminDashboardPage') || id.includes('/src/components/admin/')) {
              return 'admin-panel';
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
