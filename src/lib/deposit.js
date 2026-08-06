export const TAX_RATES = {
	general: 0.154, // 일반과세 (이자소득세 14% + 지방소득세 1.4%)
	preferential: 0.095, // 세금우대 (조합 예탁금 등 일부 상품)
	taxFree: 0,
};

export function calcSimpleInterest(principal, annualRatePercent, months) {
	return principal * (annualRatePercent / 100) * (months / 12);
}

export function calcCompoundInterest(principal, annualRatePercent, months, compounding = 'monthly') {
	const rate = annualRatePercent / 100;
	if (compounding === 'monthly') {
		return principal * (Math.pow(1 + rate / 12, months) - 1);
	}
	return principal * (Math.pow(1 + rate, months / 12) - 1);
}

export function calcDeposit({ principal, annualRatePercent, months, interestType, taxType }) {
	const interest =
		interestType === 'compound'
			? calcCompoundInterest(principal, annualRatePercent, months)
			: calcSimpleInterest(principal, annualRatePercent, months);
	const taxRate = TAX_RATES[taxType] ?? TAX_RATES.general;
	const tax = interest * taxRate;
	const netInterest = interest - tax;
	const maturityAmount = principal + netInterest;

	return {
		interest: Math.round(interest),
		tax: Math.round(tax),
		netInterest: Math.round(netInterest),
		maturityAmount: Math.round(maturityAmount),
	};
}
