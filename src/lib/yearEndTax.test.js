import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	calcCreditCardDeduction,
	calcPensionAccountTaxCredit,
	calcChildTaxCredit,
	calcYearEndTax,
} from './yearEndTax.js';

test('calcCreditCardDeduction: 사용액이 총급여의 25% 이하면 공제 0원', () => {
	assert.equal(calcCreditCardDeduction(40_000_000, 9_000_000), 0);
});

test('calcCreditCardDeduction: 25% 초과분의 15%, 한도 내', () => {
	// 총급여 4000만, 25%=1000만, 사용액 2000만 -> 초과분 1000만 × 15% = 150만
	assert.equal(calcCreditCardDeduction(40_000_000, 20_000_000), 1_500_000);
});

test('calcPensionAccountTaxCredit: 총급여 5500만 이하 16.5%, 900만 한도', () => {
	assert.equal(calcPensionAccountTaxCredit(50_000_000, 6_000_000), 6_000_000 * 0.165);
	assert.equal(calcPensionAccountTaxCredit(50_000_000, 12_000_000), 9_000_000 * 0.165);
});

test('calcPensionAccountTaxCredit: 총급여 5500만 초과 13.2%', () => {
	assert.equal(calcPensionAccountTaxCredit(60_000_000, 6_000_000), 6_000_000 * 0.132);
});

test('calcChildTaxCredit: 자녀 수별 공제액', () => {
	assert.equal(calcChildTaxCredit(0), 0);
	assert.equal(calcChildTaxCredit(1), 250_000);
	assert.equal(calcChildTaxCredit(2), 550_000);
	assert.equal(calcChildTaxCredit(3), 950_000);
});

test('calcYearEndTax: 기납부세액이 충분히 크면 환급(양수)', () => {
	const result = calcYearEndTax({
		annualSalary: 40_000_000,
		dependents: 1,
		childrenCount: 0,
		creditCardSpend: 0,
		pensionContribution: 0,
		alreadyWithheldTax: 3_000_000,
	});
	assert.ok(result.refundOrDue > 0);
});

test('calcYearEndTax: 기납부세액이 0이면 추징(음수 또는 0)', () => {
	const result = calcYearEndTax({
		annualSalary: 40_000_000,
		dependents: 1,
		alreadyWithheldTax: 0,
	});
	assert.ok(result.refundOrDue <= 0);
});
