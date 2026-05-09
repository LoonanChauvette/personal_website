import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://loonanchauvette.com',
  output: 'hybrid', // Enable hybrid mode for API routes
  adapter: vercel(),
});
