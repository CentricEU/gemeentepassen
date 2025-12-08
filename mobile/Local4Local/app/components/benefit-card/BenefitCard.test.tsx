import React from 'react';
import { render } from '@testing-library/react-native';
import BenefitCard from './BenefitCard';
import { BenefitLightDto } from '../../utils/types/benefitLightDto';

// Mock dependencies
jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, params?: any) => {
			if (key === 'benefits.validUntil') return 'Valid Until';
			if (key === 'benefits.usage') return 'Usage';
			if (key === 'benefits.remainingAmount') return `Remaining: ${params?.amount}`;
			return key;
		}
	})
}));
jest.mock('react-native-paper', () => ({
	ProgressBar: ({ progress, color, style }: any) => (
		<progress data-testid="progress-bar" value={progress} style={style} />
	)
}));
jest.mock('../../utils/HelperUtils', () => ({
	isTablet: () => false
}));
jest.mock('../../../i18n', () => ({
	language: 'en'
}));
jest.mock('../../utils/DateUtils', () => ({
	convertDateFormat: (date: string) => `formatted-${date}`
}));

const mockBenefit: BenefitLightDto = {
	id: '1',
	description: 'Test Benefit Description',
	name: 'Test Benefit',
	amount: 100,
	startDate: new Date('2024-01-01'),
	expirationDate: new Date('2024-12-31'),
	status: 'ACTIVE',
	remainingAmount: 75,
	spentPercentage: 25
};

const mockInactiveBenefit: BenefitLightDto = {
	...mockBenefit,
	status: 'INACTIVE'
};

describe('BenefitCard', () => {
	it('renders benefit name and amount', () => {
		const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
		expect(getByText('Test Benefit')).toBeTruthy();
		expect(getByText('€100.00')).toBeTruthy();
	});

	it('renders expiration date', () => {
		const { getByTestId } = render(<BenefitCard benefit={mockBenefit} />);
		expect(getByTestId('benefit-expiration-date').props['children']).toBe('formatted-2024-12-31');
	});

	it('renders usage percent', () => {
		const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
		expect(getByText('Usage')).toBeTruthy();
		expect(getByText('25%')).toBeTruthy();
	});

	it('renders remaining amount', () => {
		const { getByTestId } = render(<BenefitCard benefit={mockBenefit} />);
		expect(getByTestId('benefit-remaining-amount').props['children']).toContain('Remaining: 75€');
	});

	it('applies disabled styles for inactive benefit', () => {
		const { getByTestId } = render(<BenefitCard benefit={mockInactiveBenefit} />);
		expect(getByTestId('benefit-card').props['style'][1].backgroundColor).not.toBeUndefined();
	});

	it('renders with different locale', () => {
		jest.mock('../../../i18n', () => ({ language: 'nl' }));
		const { getByText } = render(<BenefitCard benefit={mockBenefit} />);
		expect(getByText('€100.00')).toBeTruthy();
	});
});
