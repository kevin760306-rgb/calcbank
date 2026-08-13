import { ACQUISITION_TAX } from '../data/rates.js';

/** 유상 매매 주택의 표준세율(1~3%). 6~9억 구간은 슬라이딩 공식을 적용한다. */
export function calcStandardAcquisitionRate(price) {
	const { lowThreshold, highThreshold, lowRate, highRate } = ACQUISITION_TAX.standard;
	if (price <= lowThreshold) return lowRate;
	if (price > highThreshold) return highRate;
	// 공식: (취득가액 × 2 / 3억 − 3) / 100
	return (price * (2 / 300_000_000) - 3) / 100;
}

/**
 * 다주택 중과가 시작되는 주택 수는 조정대상지역·비조정대상지역이 다르다.
 * 조정대상지역: 2주택 8% / 3주택 이상 12%. 비조정대상지역: 3주택 8% / 4주택 이상 12%.
 */
export function getAcquisitionRate({ price, homeCount, isRegulated }) {
	if (isRegulated) {
		if (homeCount >= 3) return ACQUISITION_TAX.multiHomeRate.regulated[3];
		if (homeCount === 2) return ACQUISITION_TAX.multiHomeRate.regulated[2];
	} else {
		if (homeCount >= 4) return ACQUISITION_TAX.multiHomeRate.nonRegulated[4];
		if (homeCount === 3) return ACQUISITION_TAX.multiHomeRate.nonRegulated[3];
	}
	return calcStandardAcquisitionRate(price);
}

export function calcAcquisitionTax({ price, homeCount = 1, isRegulated = false, exclusiveAreaSqm = 84 }) {
	const rate = getAcquisitionRate({ price, homeCount, isRegulated });
	const isMultiHomeSurtax = (isRegulated && homeCount >= 2) || (!isRegulated && homeCount >= 3);
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
