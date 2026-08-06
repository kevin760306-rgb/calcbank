import { calcThreeMonthDays } from './severance.js';
import { UNEMPLOYMENT_BENEFIT } from '../data/rates.js';

export function getBenefitDays(insuredYears, isOver50) {
	for (const row of UNEMPLOYMENT_BENEFIT.benefitDaysTable) {
		if (insuredYears <= row.maxYears) {
			return isOver50 ? row.over50 : row.under50;
		}
	}
	const last = UNEMPLOYMENT_BENEFIT.benefitDaysTable.at(-1);
	return isOver50 ? last.over50 : last.under50;
}

/**
 * 구직급여(실업급여) = 이직 전 평균임금의 60% × 소정급여일수, 1일 상/하한액 적용.
 */
export function calcUnemploymentBenefit({ resignDate, threeMonthWage, insuredYears, isOver50 }) {
	const threeMonthDays = calcThreeMonthDays(resignDate);
	const averageDailyWage = threeMonthWage / threeMonthDays;
	const rawDaily = averageDailyWage * UNEMPLOYMENT_BENEFIT.rateOfAverageWage;
	const dailyBenefit = Math.min(
		Math.max(rawDaily, UNEMPLOYMENT_BENEFIT.dailyFloor),
		UNEMPLOYMENT_BENEFIT.dailyCeiling
	);
	const benefitDays = getBenefitDays(insuredYears, isOver50);
	const totalBenefit = dailyBenefit * benefitDays;

	return {
		threeMonthDays,
		averageDailyWage: Math.round(averageDailyWage),
		dailyBenefit: Math.round(dailyBenefit),
		benefitDays,
		totalBenefit: Math.round(totalBenefit),
	};
}
