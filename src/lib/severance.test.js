import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	calcServiceDays,
	calcThreeMonthDays,
	calcAverageDailyWage,
	calcSeverancePay,
} from './severance.js';

test('calcThreeMonthDays: 2025-10-01 ~ 2026-01-01 = 92일', () => {
	assert.equal(calcThreeMonthDays('2026-01-01'), 92);
});

test('calcServiceDays: 정확히 1년(2025-01-01~2026-01-01, 양끝 포함) = 366일', () => {
	assert.equal(calcServiceDays('2025-01-01', '2026-01-01'), 366);
});

test('calcAverageDailyWage: 상여/연차수당 3/12 반영', () => {
	const wage = calcAverageDailyWage({
		threeMonthWage: 9_000_000,
		annualBonus: 4_000_000,
		annualLeaveAllowance: 1_200_000,
		threeMonthDays: 92,
	});
	// (9,000,000 + 1,000,000 + 300,000) / 92
	assert.ok(Math.abs(wage - 10_300_000 / 92) < 1e-6);
});

test('calcSeverancePay: 근속 1년 미만은 eligible=false', () => {
	const result = calcSeverancePay({
		startDate: '2025-06-01',
		endDate: '2026-01-01',
		threeMonthWage: 9_000_000,
	});
	assert.equal(result.eligible, false);
});

test('calcSeverancePay: 근속 3년, 월 300만원 기준 대략치 검증', () => {
	const result = calcSeverancePay({
		startDate: '2023-01-01',
		endDate: '2026-01-01',
		threeMonthWage: 9_000_000,
	});
	assert.equal(result.eligible, true);
	// 평균임금 ≈ 9,000,000 / 92 ≈ 97,826원/일 → 퇴직금 ≈ 평균임금×30×(재직일수/365)
	const expectedDailyWage = 9_000_000 / 92;
	const expectedPay = Math.round(expectedDailyWage * 30 * (result.serviceDays / 365));
	assert.equal(result.severancePay, expectedPay);
	assert.ok(result.severancePay > 8_500_000 && result.severancePay < 9_200_000);
});
