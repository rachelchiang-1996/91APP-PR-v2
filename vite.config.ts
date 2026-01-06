import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // 這讓程式碼中的 process.env.API_KEY 在 Vercel 建置時能正確讀取環境變數
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // 防止 process 未定義導致的錯誤
      'process.env': {}
    }
  };
});