// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://psoren.github.io',
	base: '/indian-gov-tech-audit',
	integrations: [
		starlight({
			title: 'Indian Gov Tech Audit',
			description:
				'A teardown catalog of Indian government websites — what is actually under the hood.',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/psoren/indian-gov-tech-audit',
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
					label: 'Audits',
					items: [
						{
							label: 'Passport Seva (passportindia.gov.in)',
							slug: 'audits/passport-seva',
						},
						{
							label: 'Indian Visa Online (indianvisaonline.gov.in)',
							slug: 'audits/indian-visa-online',
						},
					],
				},
				{
					label: 'Scam tracker',
					items: [
						{
							label: 'Fake India visa sites',
							slug: 'scams/fake-visa-sites',
						},
					],
				},
			],
		}),
	],
});
