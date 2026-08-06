const MS_PER_DAY = 86_400_000;

export function calcServiceDays(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
	return days;
}

export function calcThreeMonthDays(endDate) {
	const end = new Date(endDate);
	const threeMonthsAgo = new Date(end);
	threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
	return Math.round((end.getTime() - threeMonthsAgo.getTime()) / MS_PER_DAY);
}

export function calcAverageDailyWage({
	threeMonthWage,
	annualBonus = 0,
	annualLeaveAllowance = 0,
	threeMonthDays,
}) {
	const bonusPortion = (annualBonus * 3) / 12;
	const leavePortion = (annualLeaveAllowance * 3) / 12;
	return (threeMonthWage + bonusPortion + leavePortion) / threeMonthDays;
}

/**
 * 퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
 * 근속 1년 미만은 법정 퇴직금 지급 의무가 없어 eligible: false 로 표시한다.
 */
export function calcSeverancePay({
	startDate,
	endDate,
	threeMonthWage,
	annualBonus = 0,
	annualLeaveAllowance = 0,
}) {
	const serviceDays = calcServiceDays(startDate, endDate);
	const threeMonthDays = calcThreeMonthDays(endDate);
	const averageDailyWage = calcAverageDailyWage({
		threeMonthWage,
		annualBonus,
		annualLeaveAllowance,
		threeMonthDays,
	});
	const severancePay = averageDailyWage * 30 * (serviceDays / 365);

	return {
		serviceDays,
		threeMonthDays,
		averageDailyWage: Math.round(averageDailyWage),
		severancePay: Math.round(severancePay),
		eligible: serviceDays >= 365,
	};
}
