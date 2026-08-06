// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 실제 도메인이 정해지면 이 site 값만 교체하면 된다.
export default defineConfig({
	site: 'https://moneyledger.example.com',
	integrations: [sitemap()],
});
