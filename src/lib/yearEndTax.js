import { calcEarnedIncomeDeduction, calcIncomeTax, calcEarnedIncomeTaxCredit, calcSocialInsurance } from './salary.js';
import { PERSONAL_DEDUCTION_PER_PERSON } from '../data/rates.js';

const STANDARD_TAX_CREDIT = 130_000; // 특별(세액)공제 미신청 근로자에게 적용되는 표준세액공제

/**
 * 신용카드 등 사용액 소득공제 (간이: 전액 신용카드 기준 15%로 가정, 체크카드/전통시장 등 우대율 미반영)
 */
export function calcCreditCardDeduction(annualSalary, creditCardSpend) {
	if (!creditCardSpend) return 0;
	const threshold = annualSalary * 0.25;
	const base = Math.max(creditCardSpend - threshold, 0);
	const raw = base * 0.15;

	let limit;
	if (annualSalary <= 70_000_000) limit = 3_000_000;
	else if (annualSalary <= 120_000_000) limit = 2_500_000;
	else limit = 2_000_000;

	return Math.min(raw, limit);
}

/** 연금계좌(연금저축+IRP) 세액공제. 납입한도 900만원, 총급여 5,500만원 기준 공제율 16.5%/13.2% */
export function calcPensionAccountTaxCredit(annualSalary, contribution) {
	if (!contribution) return 0;
	const cappedContribution = Math.min(contribution, 9_000_000);
	const rate = annualSalary <= 55_000_000 ? 0.165 : 0.132;
	return cappedContribution * rate;
}

/** 자녀세액공제: 8세 이상 자녀 첫째 25만원, 둘째 30만원, 셋째부터 1인당 40만원 */
export function calcChildTaxCredit(childrenCount) {
	if (childrenCount <= 0) return 0;
	if (childrenCount === 1) return 250_000;
	if (childrenCount === 2) return 250_000 + 300_000;
	return 250_000 + 300_000 + (childrenCount - 2) * 400_000;
}

/**
 * 연말정산 간이 계산.
 * 신용카드 등 사용액을 입력하면 특별소득공제를 적용하고, 입력하지 않으면 표준세액공제(13만원)를 적용한다
 * (실제 연말정산은 두 방식 중 유리한 쪽을 선택하지만, 이 계산기는 입력 여부로 자동 분기한다).
 */
export function calcYearEndTax({
	annualSalary,
	dependents = 1,
	childrenCount = 0,
	creditCardSpend = 0,
	pensionContribution = 0,
	alreadyWithheldTax = 0,
}) {
	const monthlySalary = annualSalary / 12;
	const social = calcSocialInsurance(monthlySalary);
	const annualSocialTotal =
		(social.nationalPension + social.healthInsurance + social.longTermCare + social.employmentInsurance) * 12;

	const earnedIncomeDeduction = calcEarnedIncomeDeduction(annualSalary);
	const earnedIncomeAmount = annualSalary - earnedIncomeDeduction;
	const personalDeduction = dependents * PERSONAL_DEDUCTION_PER_PERSON;
	const creditCardDeduction = calcCreditCardDeduction(annualSalary, creditCardSpend);

	const taxableIncome = Math.max(
		earnedIncomeAmount - personalDeduction - annualSocialTotal - creditCardDeduction,
		0
	);

	const calculatedTax = calcIncomeTax(taxableIncome);
	const earnedIncomeTaxCredit = calcEarnedIncomeTaxCredit(calculatedTax, annualSalary);
	const childTaxCredit = calcChildTaxCredit(childrenCount);
	const pensionTaxCredit = calcPensionAccountTaxCredit(annualSalary, pensionContribution);
	const standardTaxCredit = creditCardSpend > 0 ? 0 : STANDARD_TAX_CREDIT;

	const totalTaxCredit = earnedIncomeTaxCredit + childTaxCredit + pensionTaxCredit + standardTaxCredit;
	const finalTax = Math.max(calculatedTax - totalTaxCredit, 0);
	const finalTaxWithLocal = finalTax * 1.1;
	const refundOrDue = alreadyWithheldTax - finalTaxWithLocal;

	return {
		taxableIncome: Math.round(taxableIncome),
		calculatedTax: Math.round(calculatedTax),
		earnedIncomeTaxCredit: Math.round(earnedIncomeTaxCredit),
		childTaxCredit: Math.round(childTaxCredit),
		pensionTaxCredit: Math.round(pensionTaxCredit),
		standardTaxCredit: Math.round(standardTaxCredit),
		finalTax: Math.round(finalTax),
		finalTaxWithLocal: Math.round(finalTaxWithLocal),
		refundOrDue: Math.round(refundOrDue),
	};
}
