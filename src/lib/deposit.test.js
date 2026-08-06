import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcSimpleInterest, calcCompoundInterest, calcDeposit } from './deposit.js';

test('calcSimpleInterest: 원금 1000만원, 연 3%, 12개월 = 30만원', () => {
	assert.equal(calcSimpleInterest(10_000_000, 3, 12), 300_000);
});

test('calcCompoundInterest(월복리)는 단리보다 이자가 많다 (12개월, 동일 조건)', () => {
	const simple = calcSimpleInterest(10_000_000, 3, 12);
	const compound = calcCompoundInterest(10_000_000, 3, 12);
	assert.ok(compound > simple);
});

test('calcDeposit: 일반과세 15.4% 적용', () => {
	const result = calcDeposit({
		principal: 10_000_000,
		annualRatePercent: 3,
		months: 12,
		interestType: 'simple',
		taxType: 'general',
	});
	assert.equal(result.interest, 300_000);
	assert.equal(result.tax, Math.round(300_000 * 0.154));
	assert.equal(result.netInterest, 300_000 - Math.round(300_000 * 0.154));
	assert.equal(result.maturityAmount, 10_000_000 + result.netInterest);
});

test('calcDeposit: 비과세는 세금 0원', () => {
	const result = calcDeposit({
		principal: 10_000_000,
		annualRatePercent: 3,
		months: 12,
		interestType: 'simple',
		taxType: 'taxFree',
	});
	assert.equal(result.tax, 0);
	assert.equal(result.netInterest, result.interest);
});
