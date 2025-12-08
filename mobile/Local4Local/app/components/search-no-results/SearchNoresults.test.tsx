import { render, fireEvent } from '@testing-library/react-native';
import SearchNoResults from './SearchNoResults';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

describe('SearchNoResults', () => {
	it.each([
		['offersPage.noResultsFound', 'offersPage.NoResultsDescription'],
		['transactions.noTransactionsTitle', 'transactions.noTransactionsDescription']
	])('renders expected text for titleKey: %s and descriptionKey: %s', (titleKey, descriptionKey) => {
		const mockReset = jest.fn();
		const { getByText } = render(
			<SearchNoResults titleKey={titleKey} descriptionKey={descriptionKey} onResetToInitialState={mockReset} />
		);

		expect(getByText(titleKey)).toBeTruthy();
		expect(getByText(descriptionKey)).toBeTruthy();
		expect(getByText('offersPage.seeAllOffers')).toBeTruthy();
	});

	it('should call onResetToInitialState when button is pressed', () => {
		const mockReset = jest.fn();
		const { getByText } = render(
			<SearchNoResults onResetToInitialState={mockReset} titleKey={''} descriptionKey={''} />
		);

		const button = getByText('offersPage.seeAllOffers');
		fireEvent.press(button);

		expect(mockReset).toHaveBeenCalledTimes(1);
	});
});
