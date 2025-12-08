import { render } from '@testing-library/react-native';
import TransactionList from './TransactionList';
import { OfferTransactionsGroupedDto } from '../../utils/types/offerTransactionGroupedDto';
import { Text } from 'react-native';

jest.mock('../transaction-item/TransactionItem', () => {
	return ({ transaction }: { transaction: any }) => <Text>{transaction.offerTitle}</Text>;
});

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

const createMockTransaction = (title: string): OfferTransactionsGroupedDto => ({
	offerTitle: title,
	supplierName: 'Test Supplier',
	amount: 100,
	createdDate: '01-03-2025',
	offerType: {
		offerTypeId: 1,
		offerTypeLabel: 'offer.types.discount'
	}
});

describe('TransactionList', () => {
	it('renders month header correctly', () => {
		const { getByText } = render(<TransactionList monthKey="2025-03" transactions={[]} />);

		expect(getByText('months.03 2025')).toBeTruthy();
	});

	it('renders no transactions message when list is empty', () => {
		const { getByText } = render(<TransactionList monthKey="2025-03" transactions={[]} />);

		expect(getByText('transactions.noTransactionsThisMonth')).toBeTruthy();
	});

	it('renders all transaction items when transactions exist', () => {
		const transactions = [createMockTransaction('Transaction A'), createMockTransaction('Transaction B')];

		const { getByText } = render(<TransactionList monthKey="2025-03" transactions={transactions} />);

		expect(getByText('Transaction A')).toBeTruthy();
		expect(getByText('Transaction B')).toBeTruthy();
	});
});
