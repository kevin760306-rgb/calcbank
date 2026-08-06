export function calcEqualInstallmentPayment(principal, monthlyRate, months) {
	if (monthlyRate === 0) return principal / months;
	const factor = Math.pow(1 + monthlyRate, months);
	return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * 대출 상환 스케줄을 생성한다.
 * type: 'equal-installment'(원리금균등) | 'equal-principal'(원금균등) | 'bullet'(만기일시)
 */
export function buildLoanSchedule({ principal, annualRatePercent, months, type }) {
	const monthlyRate = annualRatePercent / 100 / 12;
	let balance = principal;
	const schedule = [];

	if (type === 'equal-installment') {
		const payment = calcEqualInstallmentPayment(principal, monthlyRate, months);
		for (let m = 1; m <= months; m++) {
			const interest = balance * monthlyRate;
			let principalPortion = payment - interest;
			if (m === months) principalPortion = balance;
			balance -= principalPortion;
			schedule.push({
				month: m,
				payment: Math.round(principalPortion + interest),
				principal: Math.round(principalPortion),
				interest: Math.round(interest),
				balance: Math.max(Math.round(balance), 0),
			});
		}
	} else if (type === 'equal-principal') {
		const principalPortionFixed = principal / months;
		for (let m = 1; m <= months; m++) {
			const interest = balance * monthlyRate;
			balance -= principalPortionFixed;
			schedule.push({
				month: m,
				payment: Math.round(principalPortionFixed + interest),
				principal: Math.round(principalPortionFixed),
				interest: Math.round(interest),
				balance: Math.max(Math.round(balance), 0),
			});
		}
	} else if (type === 'bullet') {
		for (let m = 1; m <= months; m++) {
			const interest = balance * monthlyRate;
			const isLast = m === months;
			const principalPortion = isLast ? balance : 0;
			balance -= principalPortion;
			schedule.push({
				month: m,
				payment: Math.round(principalPortion + interest),
				principal: Math.round(principalPortion),
				interest: Math.round(interest),
				balance: Math.max(Math.round(balance), 0),
			});
		}
	} else {
		throw new Error(`Unknown loan type: ${type}`);
	}

	const totalPayment = schedule.reduce((sum, r) => sum + r.payment, 0);
	const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);

	return { schedule, totalPayment, totalInterest };
}
