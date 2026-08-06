// 전 페이지(홈/헤더/관련 링크)에서 재사용하는 계산기 메타 정보.
// no: 장부 카드 헤더에 쓰이는 전표 번호("No. 01" 등)
export const calculators = [
	{
		no: '01',
		slug: 'severance',
		title: '퇴직금 계산기',
		short: '퇴직금',
		desc: '평균임금과 근속연수로 퇴직금을 계산합니다.',
		ledgerLabel: 'RETIREMENT PAY',
	},
	{
		no: '02',
		slug: 'loan',
		title: '대출 이자 계산기',
		short: '대출 상환',
		desc: '원리금균등·원금균등·만기일시 상환액을 비교합니다.',
		ledgerLabel: 'LOAN REPAYMENT',
	},
	{
		no: '03',
		slug: 'deposit',
		title: '예금 이자 계산기',
		short: '예금 이자',
		desc: '단리·복리 예금 이자와 세후 수령액을 계산합니다.',
		ledgerLabel: 'DEPOSIT INTEREST',
	},
	{
		no: '04',
		slug: 'salary',
		title: '연봉 실수령액 계산기',
		short: '연봉 실수령액',
		desc: '4대 보험과 세금을 뗀 월 실수령액을 계산합니다.',
		ledgerLabel: 'NET SALARY',
	},
	{
		no: '05',
		slug: 'year-end-tax',
		title: '연말정산 환급금 계산기',
		short: '연말정산',
		desc: '소득·세액공제를 반영한 예상 환급/추징 세액을 계산합니다.',
		ledgerLabel: 'YEAR-END TAX',
	},
	{
		no: '06',
		slug: 'unemployment',
		title: '실업급여 계산기',
		short: '실업급여',
		desc: '평균임금과 가입기간으로 구직급여 예상액을 계산합니다.',
		ledgerLabel: 'JOBSEEKER BENEFIT',
	},
	{
		no: '07',
		slug: 'acquisition-tax',
		title: '부동산 취득세 계산기',
		short: '취득세',
		desc: '주택 가액과 보유 주택 수에 따른 취득세를 계산합니다.',
		ledgerLabel: 'ACQUISITION TAX',
	},
	{
		no: '08',
		slug: 'parental-leave',
		title: '육아휴직 급여 계산기',
		short: '육아휴직 급여',
		desc: '통상임금과 휴직 기간별 육아휴직 급여를 계산합니다.',
		ledgerLabel: 'PARENTAL LEAVE PAY',
	},
];

export function getCalculator(slug) {
	return calculators.find((c) => c.slug === slug);
}

export function getRelated(slug, count = 3) {
	const others = calculators.filter((c) => c.slug !== slug);
	return others.slice(0, count);
}
