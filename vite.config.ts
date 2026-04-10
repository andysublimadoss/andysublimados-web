import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          ignored: ['**/data.json', '**/node_modules/**']
        }
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || null),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || null)
      },
      build: {
        // Deshabilitar source maps en producción
        sourcemap: false,
        // Minificar código
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Eliminar console.log en producción
            drop_debugger: true // Eliminar debugger statements
          },
          mangle: true, // Ofuscar nombres de variables
          format: {
            comments: false // Eliminar todos los comentarios
          }
        },
        // Configuración de chunks para mejor performance
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              'charts-vendor': ['recharts']
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@/components': path.resolve(__dirname, './src/components'),
          '@/features': path.resolve(__dirname, './src/features'),
          '@/hooks': path.resolve(__dirname, './src/hooks'),
          '@/services': path.resolve(__dirname, './src/services'),
          '@/utils': path.resolve(__dirname, './src/utils'),
          '@/types': path.resolve(__dirname, './src/types'),
          '@/lib': path.resolve(__dirname, './src/lib')
        }
      }
    };
});
