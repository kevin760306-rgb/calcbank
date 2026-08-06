import {
	NATIONAL_PENSION,
	HEALTH_INSURANCE,
	EMPLOYMENT_INSURANCE,
	EARNED_INCOME_DEDUCTION_BRACKETS,
	PERSONAL_DEDUCTION_PER_PERSON,
	INCOME_TAX_BRACKETS,
	LOCAL_INCOME_TAX_RATE,
} from '../data/rates.js';

export function calcEarnedIncomeDeduction(annualSalary) {
	let prevUpTo = 0;
	for (const b of EARNED_INCOME_DEDUCTION_BRACKETS) {
		if (annualSalary <= b.upTo) {
			return b.base + (annualSalary - prevUpTo) * b.rate;
		}
		prevUpTo = b.upTo;
	}
	return 0;
}

export function calcIncomeTax(taxableIncome) {
	if (taxableIncome <= 0) return 0;
	const bracket = INCOME_TAX_BRACKETS.find((b) => taxableIncome <= b.upTo);
	return taxableIncome * bracket.rate - bracket.deduction;
}

/**
 * 근로소득세액공제 (소득세법 제59조). 산출세액 구간별 공제율과 총급여 구간별 한도를 적용한다.
 */
export function calcEarnedIncomeTaxCredit(calculatedTax, annualSalary) {
	if (calculatedTax <= 0) return 0;
	const credit =
		calculatedTax <= 1_300_000 ? calculatedTax * 0.55 : 715_000 + (calculatedTax - 1_300_000) * 0.3;

	let limit;
	if (annualSalary <= 33_000_000) {
		limit = 740_000;
	} else if (annualSalary <= 70_000_000) {
		limit = Math.max(740_000 - (annualSalary - 33_000_000) * 0.008, 660_000);
	} else if (annualSalary <= 120_000_000) {
		limit = Math.max(660_000 - (annualSalary - 70_000_000) * 0.5, 500_000);
	} else {
		limit = Math.max(500_000 - (annualSalary - 120_000_000) * 0.5, 200_000);
	}

	return Math.min(credit, limit);
}

export function calcSocialInsurance(monthlySalary) {
	const pensionBase = Math.min(
		Math.max(monthlySalary, NATIONAL_PENSION.incomeFloor),
		NATIONAL_PENSION.incomeCeiling
	);
	const nationalPension = pensionBase * NATIONAL_PENSION.employeeRate;
	const healthInsurance = monthlySalary * HEALTH_INSURANCE.employeeRate;
	const longTermCare = healthInsurance * HEALTH_INSURANCE.longTermCareRateOfPremium;
	const employmentInsurance = monthlySalary * EMPLOYMENT_INSURANCE.employeeRate;
	return { nationalPension, healthInsurance, longTermCare, employmentInsurance };
}

/**
 * 연봉 실수령액 간이 계산.
 * 국세청 근로소득 간이세액표 대신, 근로소득공제·인적공제·사회보험료공제를 반영한
 * 연간 산출세액을 12로 나누는 방식으로 근사한다. 실제 원천징수액과 차이가 있을 수 있다.
 */
export function calcNetSalary({ annualSalary, dependents = 1 }) {
	const monthlySalary = annualSalary / 12;
	const social = calcSocialInsurance(monthlySalary);
	const monthlySocialTotal =
		social.nationalPension + social.healthInsurance + social.longTermCare + social.employmentInsurance;
	const annualSocialTotal = monthlySocialTotal * 12;

	const earnedIncomeDeduction = calcEarnedIncomeDeduction(annualSalary);
	const earnedIncomeAmount = annualSalary - earnedIncomeDeduction;
	const personalDeduction = dependents * PERSONAL_DEDUCTION_PER_PERSON;
	const taxableIncome = Math.max(earnedIncomeAmount - personalDeduction - annualSocialTotal, 0);

	const calculatedTax = calcIncomeTax(taxableIncome);
	const taxCredit = calcEarnedIncomeTaxCredit(calculatedTax, annualSalary);
	const annualIncomeTax = Math.max(calculatedTax - taxCredit, 0);
	const monthlyIncomeTax = annualIncomeTax / 12;
	const monthlyLocalTax = monthlyIncomeTax * LOCAL_INCOME_TAX_RATE;

	const monthlyDeductionTotal = monthlySocialTotal + monthlyIncomeTax + monthlyLocalTax;
	const monthlyNet = monthlySalary - monthlyDeductionTotal;

	return {
		monthlySalary: Math.round(monthlySalary),
		nationalPension: Math.round(social.nationalPension),
		healthInsurance: Math.round(social.healthInsurance),
		longTermCare: Math.round(social.longTermCare),
		employmentInsurance: Math.round(social.employmentInsurance),
		monthlyIncomeTax: Math.round(monthlyIncomeTax),
		monthlyLocalTax: Math.round(monthlyLocalTax),
		monthlyNet: Math.round(monthlyNet),
		annualNet: Math.round(monthlyNet * 12),
	};
}
