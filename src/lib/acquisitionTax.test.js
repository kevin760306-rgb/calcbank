import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	calcStandardAcquisitionRate,
	getAcquisitionRate,
	calcAcquisitionTax,
} from './acquisitionTax.js';

test('calcStandardAcquisitionRate: 6억 이하는 1%', () => {
	assert.equal(calcStandardAcquisitionRate(500_000_000), 0.01);
	assert.equal(calcStandardAcquisitionRate(600_000_000), 0.01);
});

test('calcStandardAcquisitionRate: 9억 초과는 3%', () => {
	assert.equal(calcStandardAcquisitionRate(1_000_000_000), 0.03);
});

test('calcStandardAcquisitionRate: 슬라이딩 구간(7.5억 -> 2%)', () => {
	assert.ok(Math.abs(calcStandardAcquisitionRate(750_000_000) - 0.02) < 1e-9);
});

test('getAcquisitionRate: 조정지역 다주택(3주택)은 12%', () => {
	assert.equal(getAcquisitionRate({ price: 500_000_000, homeCount: 3, isRegulated: true }), 0.12);
});

test('getAcquisitionRate: 1주택은 조정지역 여부와 무관하게 표준세율', () => {
	assert.equal(getAcquisitionRate({ price: 500_000_000, homeCount: 1, isRegulated: true }), 0.01);
});

test('calcAcquisitionTax: 7.5억, 전용 100㎡, 1주택 표준세율 -> 총 1,800만원', () => {
	const result = calcAcquisitionTax({
		price: 750_000_000,
		homeCount: 1,
		isRegulated: false,
		exclusiveAreaSqm: 100,
	});
	assert.equal(result.acquisitionTax, 15_000_000);
	assert.equal(result.localEducationTax, 1_500_000);
	assert.equal(result.ruralSpecialTax, 1_500_000);
	assert.equal(result.totalTax, 18_000_000);
});

test('calcAcquisitionTax: 85㎡ 이하는 농특세 미부과(표준세율 케이스)', () => {
	const result = calcAcquisitionTax({
		price: 500_000_000,
		homeCount: 1,
		isRegulated: false,
		exclusiveAreaSqm: 59,
	});
	assert.equal(result.ruralSpecialTax, 0);
});

test('calcAcquisitionTax: 조정지역 2주택 중과(8%)', () => {
	const result = calcAcquisitionTax({
		price: 1_000_000_000,
		homeCount: 2,
		isRegulated: true,
		exclusiveAreaSqm: 100,
	});
	assert.equal(result.acquisitionTax, 80_000_000);
	assert.equal(result.localEducationTax, 4_000_000);
	assert.equal(result.ruralSpecialTax, 10_000_000);
	assert.equal(result.totalTax, 94_000_000);
});
