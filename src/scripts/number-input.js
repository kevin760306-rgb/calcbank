export function attachCommaFormatting(input) {
	input.addEventListener('input', () => {
		const raw = input.value.replace(/[^0-9]/g, '');
		input.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
	});
}

export function parseNumber(value) {
	return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

export function formatWon(value) {
	return `${Math.round(value).toLocaleString('ko-KR')}원`;
}
