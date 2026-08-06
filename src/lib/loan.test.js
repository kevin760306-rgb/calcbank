import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcEqualInstallmentPayment, buildLoanSchedule } from './loan.js';

test('calcEqualInstallmentPayment: 무이자면 원금/개월수', () => {
	const payment = calcEqualInstallmentPayment(120_000_000, 0, 12);
	assert.equal(payment, 10_000_000);
});

test('equal-installment: 마지막 회차에 잔액이 정확히 0으로 정리됨', () => {
	const { schedule, totalPayment, totalInterest } = buildLoanSchedule({
		principal: 120_000_000,
		annualRatePercent: 4.8,
		months: 12,
		type: 'equal-installment',
	});
	assert.equal(schedule.length, 12);
	assert.equal(schedule.at(-1).balance, 0);
	assert.ok(totalInterest > 0);
	// payment/principal/interest를 각각 반올림하므로 합계에 회차 수 이내의 오차가 생길 수 있음
	assert.ok(Math.abs(totalPayment - (120_000_000 + totalInterest)) <= schedule.length);
	// 원리금균등은 매달 총 상환액이 거의 동일해야 함(반올림 오차 1원 이내)
	const payments = schedule.slice(0, -1).map((r) => r.payment);
	const max = Math.max(...payments);
	const min = Math.min(...payments);
	assert.ok(max - min <= 1);
});

test('equal-principal: 원금 상환분이 매달 동일하고 이자는 감소', () => {
	const { schedule } = buildLoanSchedule({
		principal: 120_000_000,
		annualRatePercent: 4.8,
		months: 12,
		type: 'equal-principal',
	});
	assert.equal(schedule[0].principal, 10_000_000);
	assert.equal(schedule.at(-1).balance, 0);
	assert.ok(schedule[0].interest > schedule.at(-1).interest);
});

test('bullet: 마지막 회차 전까지는 이자만 납부, 원금은 만기에 일시 상환', () => {
	const { schedule, totalInterest } = buildLoanSchedule({
		principal: 100_000_000,
		annualRatePercent: 6,
		months: 6,
		type: 'bullet',
	});
	for (const row of schedule.slice(0, -1)) {
		assert.equal(row.principal, 0);
	}
	assert.equal(schedule.at(-1).principal, 100_000_000);
	assert.equal(schedule.at(-1).balance, 0);
	// 매달 이자가 동일(잔액이 만기까지 그대로이므로)
	const monthlyRate = 6 / 100 / 12;
	assert.equal(totalInterest, Math.round(100_000_000 * monthlyRate) * 6);
});
