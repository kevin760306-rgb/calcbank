import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	calcEarnedIncomeDeduction,
	calcIncomeTax,
	calcEarnedIncomeTaxCredit,
	calcSocialInsurance,
	calcNetSalary,
} from './salary.js';

test('calcEarnedIncomeDeduction: 총급여 3천만원', () => {
	// 750만 + (3000만-1500만)×15% = 750만 + 225만 = 975만
	assert.equal(calcEarnedIncomeDeduction(30_000_000), 9_750_000);
});

test('calcIncomeTax: 과세표준 2000만원 (2구간)', () => {
	// 2000만×15% - 126만 = 300만 - 126만 = 174만
	assert.equal(calcIncomeTax(20_000_000), 1_740_000);
});

test('calcIncomeTax: 과세표준 0 이하는 0', () => {
	assert.equal(calcIncomeTax(0), 0);
	assert.equal(calcIncomeTax(-100), 0);
});

test('calcEarnedIncomeTaxCredit: 산출세액 174만원, 총급여 4000만원', () => {
	// credit = 71.5만 + (174만-130만)×30% = 71.5만+13.2만 = 84.7만
	// limit = 74만 - (4000만-3300만)×0.008 = 74만-5.6만 = 68.4만 (>=66만 유지)
	// min(84.7만, 68.4만) = 68.4만
	const credit = calcEarnedIncomeTaxCredit(1_740_000, 40_000_000);
	assert.equal(credit, 684_000);
});

test('calcSocialInsurance: 월급 300만원', () => {
	const s = calcSocialInsurance(3_000_000);
	assert.equal(s.nationalPension, 3_000_000 * 0.0475);
	assert.equal(s.healthInsurance, 3_000_000 * 0.03595);
	assert.ok(Math.abs(s.longTermCare - s.healthInsurance * 0.1314) < 1e-6);
	assert.equal(s.employmentInsurance, 3_000_000 * 0.009);
});

test('calcSocialInsurance: 국민연금 상한액 적용(월급 1000만원)', () => {
	const s = calcSocialInsurance(10_000_000);
	assert.equal(s.nationalPension, 6_590_000 * 0.0475);
});

test('calcNetSalary: 연봉 4천만원, 실수령액이 월급보다 작고 0보다 큼', () => {
	const result = calcNetSalary({ annualSalary: 40_000_000, dependents: 1 });
	assert.equal(result.monthlySalary, Math.round(40_000_000 / 12));
	assert.ok(result.monthlyNet > 0);
	assert.ok(result.monthlyNet < result.monthlySalary);
});
