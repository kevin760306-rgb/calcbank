import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBenefitDays, calcUnemploymentBenefit } from './unemployment.js';

test('getBenefitDays: 가입 6개월, 50세 미만 = 120일', () => {
	assert.equal(getBenefitDays(0.5, false), 120);
});

test('getBenefitDays: 가입 2년, 50세 미만 = 150일 / 50세 이상 = 180일', () => {
	assert.equal(getBenefitDays(2, false), 150);
	assert.equal(getBenefitDays(2, true), 180);
});

test('getBenefitDays: 가입 12년, 50세 미만 = 240일', () => {
	assert.equal(getBenefitDays(12, false), 240);
});

test('calcUnemploymentBenefit: 저임금은 하한액(66,048원) 적용', () => {
	const result = calcUnemploymentBenefit({
		resignDate: '2026-01-01',
		threeMonthWage: 3_000_000,
		insuredYears: 2,
		isOver50: false,
	});
	assert.equal(result.dailyBenefit, 66_048);
	assert.equal(result.totalBenefit, 66_048 * 150);
});

test('calcUnemploymentBenefit: 고임금은 상한액(68,100원) 적용', () => {
	const result = calcUnemploymentBenefit({
		resignDate: '2026-01-01',
		threeMonthWage: 30_000_000,
		insuredYears: 2,
		isOver50: false,
	});
	assert.equal(result.dailyBenefit, 68_100);
});

test('calcUnemploymentBenefit: 상하한 사이 값은 평균임금의 60%', () => {
	const result = calcUnemploymentBenefit({
		resignDate: '2026-01-01',
		threeMonthWage: 112_000 * 92,
		insuredYears: 2,
		isOver50: false,
	});
	assert.equal(result.dailyBenefit, 67_200);
});
