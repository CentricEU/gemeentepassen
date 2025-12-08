import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Transactions } from './TransactionScreen';
import OfferTransactionService from '../../services/TransactionService';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../../services/TransactionService');
jest.mock('../../assets/icons/coins.svg', () => 'CoinsIcon');
jest.mock('../../components/transaction-list/TransactionList', () => {
	return ({ monthKey, transactions }: any) => (
		<>
			<Text>{monthKey}</Text>
			{transactions.map((tx: any, i: number) => (
				<Text key={i}>{tx.offerTitle}</Text>
			))}
		</>
	);
});

// jest.mock('../../components/search-bar/SearchBar', () => require('../../../__mocks__/SearchBar'));

// jest.mock('../../components/search-no-results/SearchNoResults', () => {
// 	return ({ titleKey }: any) => <Text testID="mock-no-results">{titleKey}</Text>;
// });

jest.mock('@react-navigation/stack', () => ({
	createStackNavigator: jest.fn().mockReturnValue({
		Navigator: ({ children }: any) => <>{children}</>,
		Screen: ({ component, ...rest }: any) => component({ navigation: jest.fn(), ...rest })
	})
}));

describe('Transactions Screen', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	const mockNavigation = {
		navigate: jest.fn(),
		addListener: jest.fn().mockImplementation((_, callback) => {
			callback();
			return () => { };
		}),
		setOptions: jest.fn()
	};

	const mockGroupedData = {
		'2025-03': [
			{
				offerTitle: 'Offer A',
				supplierName: 'Supplier A',
				amount: 10,
				offerType: {
					offerTypeId: 1,
					offerTypeLabel: 'offer.types.bogo'
				},
				createdDate: '2025-03-01'
			}
		]
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders transactions correctly', async () => {
		(OfferTransactionService.getUserTransactionsGrouped as jest.Mock).mockResolvedValueOnce(mockGroupedData);
		const { getByText, queryByTestId } = render(
			<NavigationContainer>
				<Transactions navigation={mockNavigation} />
			</NavigationContainer>
		);

		await waitFor(() => {
			expect(getByText('2025-03')).toBeTruthy();
			expect(getByText('Offer A')).toBeTruthy();
			expect(queryByTestId('mock-no-results')).toBeNull();
		});
	});

	it('renders SearchNoResults when all months are empty', async () => {
		(OfferTransactionService.getUserTransactionsGrouped as jest.Mock).mockResolvedValueOnce({
			'2025-03': [],
			'2025-02': []
		});

		const { getByTestId } = render(
			<NavigationContainer>
				<Transactions navigation={mockNavigation} />
			</NavigationContainer>
		);
		await waitFor(() => {
			expect(getByTestId('mock-no-results')).toBeTruthy();
		});
	});
});
