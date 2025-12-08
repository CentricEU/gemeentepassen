import React from 'react';
import { render, act } from '@testing-library/react-native';
import { MyBenefits } from './MyBenefits';
import BenefitService from '../../services/BenefitService/BenefitService';

jest.mock('../../assets/icons/no-data.svg', () => 'EmptyState');

jest.mock('react-i18next', () => ({
	...jest.requireActual('react-i18next'),
	useTranslation: () => ({ t: (key: string) => key }),
	initReactI18next: { type: '3rdParty' }
}));

jest.mock('../../services/BenefitService/BenefitService', () => ({
	getAllBenefits: jest.fn()
}));

jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: any) => callback()
}));

describe('MyBenefitsScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders empty state when there are no benefits', async () => {
		(BenefitService.getAllBenefits as jest.Mock).mockResolvedValueOnce({
			active: [],
			expired: []
		});

		await act(async () => {
			const { getByTestId } = render(<MyBenefits />);

			await Promise.resolve();

			expect(getByTestId('no-benefits-title')).toBeTruthy();
			expect(getByTestId('no-benefits-description')).toBeTruthy();
		});
	});

	it('renders active and expired benefits when data is available', async () => {
		(BenefitService.getAllBenefits as jest.Mock).mockResolvedValueOnce({
			active: [{ name: 'Active Benefit' }],
			expired: [{ name: 'Expired Benefit' }]
		});

		await act(async () => {
			const { getByText } = render(<MyBenefits />);

			await Promise.resolve();

			expect(getByText('generic.status.active')).toBeTruthy();
			expect(getByText('generic.status.expired')).toBeTruthy();
		});
	});
});
