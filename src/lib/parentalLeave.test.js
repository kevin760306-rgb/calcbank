import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	getTierForMonth,
	calcMonthlyParentalLeavePay,
	calcParentalLeavePay,
} from './parentalLeave.js';

test('getTierForMonth: 3개월까지 1구간, 4~6개월 2구간, 7개월부터 3구간', () => {
	assert.equal(getTierForMonth(3).cap, 2_500_000);
	assert.equal(getTierForMonth(4).cap, 2_000_000);
	assert.equal(getTierForMonth(6).cap, 2_000_000);
	assert.equal(getTierForMonth(7).cap, 1_600_000);
});

test('calcMonthlyParentalLeavePay: 통상임금이 상한을 넘으면 상한액으로 clamp', () => {
	assert.equal(calcMonthlyParentalLeavePay(3_000_000, 1), 2_500_000);
	assert.equal(calcMonthlyParentalLeavePay(3_000_000, 4), 2_000_000);
	assert.equal(calcMonthlyParentalLeavePay(3_000_000, 7), 1_600_000);
});

test('calcMonthlyParentalLeavePay: 저임금은 하한액 70만원 보장', () => {
	assert.equal(calcMonthlyParentalLeavePay(500_000, 1), 700_000);
	assert.equal(calcMonthlyParentalLeavePay(500_000, 7), 700_000);
});

test('calcMonthlyParentalLeavePay: 4~6개월 구간은 상한선 밑에서도 통상임금 100%(80% 아님)', () => {
	// 상한(200만원)과 하한(70만원) 사이 임금으로 실제 적용 요율을 검증한다.
	assert.equal(calcMonthlyParentalLeavePay(1_800_000, 4), 1_800_000);
	assert.equal(calcMonthlyParentalLeavePay(1_800_000, 6), 1_800_000);
});

test('calcMonthlyParentalLeavePay: 7개월 이후는 통상임금 80%로 clamp 전 값이 달라짐', () => {
	assert.equal(calcMonthlyParentalLeavePay(1_800_000, 7), 1_800_000 * 0.8);
});

test('calcParentalLeavePay: 6개월 합계 = 2,500,000×3 + 2,000,000×3', () => {
	const result = calcParentalLeavePay({ ordinaryWage: 3_000_000, months: 6 });
	assert.equal(result.months, 6);
	assert.equal(result.totalPay, 2_500_000 * 3 + 2_000_000 * 3);
});

test('calcParentalLeavePay: 최장 18개월로 제한', () => {
	const result = calcParentalLeavePay({ ordinaryWage: 3_000_000, months: 24 });
	assert.equal(result.months, 18);
});
