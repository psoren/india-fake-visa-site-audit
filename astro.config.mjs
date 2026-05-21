// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://psoren.github.io',
	base: '/india-fake-visa-site-audit',
	integrations: [
		starlight({
			title: 'India Fake Visa Site Audit',
			description:
				'A catalog and technical teardown of look-alike websites that impersonate India’s official e-Visa portal.',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/psoren/india-fake-visa-site-audit',
				},
			],
			sidebar: [
				{
					label: 'About',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Methodology', slug: 'methodology' },
					],
				},
				{
					label: 'Scam tracker',
					items: [
						{
							label: 'Fake India visa sites — advisories',
							slug: 'scams/fake-visa-sites',
						},
						{
							label: 'Fake India visa sites — technical teardown',
							slug: 'scams/fake-visa-sites-teardown',
						},
					],
				},
			],
		}),
	],
});
