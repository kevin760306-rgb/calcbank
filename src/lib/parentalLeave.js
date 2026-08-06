import { PARENTAL_LEAVE } from '../data/rates.js';

export function getTierForMonth(month) {
	return PARENTAL_LEAVE.tiers.find((t) => month <= t.untilMonth);
}

export function calcMonthlyParentalLeavePay(ordinaryWage, month) {
	const tier = getTierForMonth(month);
	const base = ordinaryWage * tier.rate;
	return Math.min(Math.max(base, PARENTAL_LEAVE.floor), tier.cap);
}

/**
 * 육아휴직급여 = 구간별(1~3개월/4~6개월/7개월~) 통상임금 비율 × 상한액, 하한액 70만원 보장.
 * 최장 지급 기간은 18개월(1년 6개월)로 제한한다.
 */
export function calcParentalLeavePay({ ordinaryWage, months }) {
	const clampedMonths = Math.min(months, PARENTAL_LEAVE.maxMonths);
	const monthlyBreakdown = [];
	let total = 0;
	for (let m = 1; m <= clampedMonths; m++) {
		const pay = calcMonthlyParentalLeavePay(ordinaryWage, m);
		monthlyBreakdown.push({ month: m, pay: Math.round(pay) });
		total += pay;
	}
	return {
		months: clampedMonths,
		monthlyBreakdown,
		totalPay: Math.round(total),
	};
}
