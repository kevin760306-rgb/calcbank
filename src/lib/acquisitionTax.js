import { ACQUISITION_TAX } from '../data/rates.js';

/** 유상 매매 주택의 표준세율(1~3%). 6~9억 구간은 슬라이딩 공식을 적용한다. */
export function calcStandardAcquisitionRate(price) {
	const { lowThreshold, highThreshold, lowRate, highRate } = ACQUISITION_TAX.standard;
	if (price <= lowThreshold) return lowRate;
	if (price > highThreshold) return highRate;
	// 공식: (취득가액 × 2 / 3억 − 3) / 100
	return (price * (2 / 300_000_000) - 3) / 100;
}

export function getAcquisitionRate({ price, homeCount, isRegulated }) {
	if (homeCount >= 2 && isRegulated) {
		const key = Math.min(homeCount, 4);
		return ACQUISITION_TAX.multiHomeRate[key] ?? ACQUISITION_TAX.multiHomeRate[4];
	}
	return calcStandardAcquisitionRate(price);
}

export function calcAcquisitionTax({ price, homeCount = 1, isRegulated = false, exclusiveAreaSqm = 84 }) {
	const rate = getAcquisitionRate({ price, homeCount, isRegulated });
	const isMultiHomeSurtax = homeCount >= 2 && isRegulated;
	const acquisitionTax = price * rate;

	const isOver85 = exclusiveAreaSqm > ACQUISITION_TAX.ruralSpecialTaxAreaThresholdSqm;

	let localEducationTax;
	let ruralSpecialTax;
	if (isMultiHomeSurtax) {
		localEducationTax = price * ACQUISITION_TAX.multiHomeSurtax.localEducationTaxRate;
		ruralSpecialTax =
			price *
			(isOver85
				? ACQUISITION_TAX.multiHomeSurtax.ruralSpecialTaxRateOver85
				: ACQUISITION_TAX.multiHomeSurtax.ruralSpecialTaxRateUnder85);
	} else {
		localEducationTax = acquisitionTax * ACQUISITION_TAX.localEducationTaxRateOfTax;
		ruralSpecialTax = isOver85 ? price * ACQUISITION_TAX.ruralSpecialTaxRate : 0;
	}

	const totalTax = acquisitionTax + localEducationTax + ruralSpecialTax;

	return {
		rate,
		acquisitionTax: Math.round(acquisitionTax),
		localEducationTax: Math.round(localEducationTax),
		ruralSpecialTax: Math.round(ruralSpecialTax),
		totalTax: Math.round(totalTax),
	};
}
