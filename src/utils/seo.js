export function webApplicationJsonLd({ name, description, url }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name,
		description,
		url,
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Any',
		inLanguage: 'ko',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'KRW',
		},
	};
}

export function faqJsonLd(items) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(({ q, a }) => ({
			'@type': 'Question',
			name: q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: a,
			},
		})),
	};
}
