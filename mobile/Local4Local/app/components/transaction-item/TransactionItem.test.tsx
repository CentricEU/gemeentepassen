import { render } from '@testing-library/react-native';
import TransactionItem from './TransactionItem';
import { OfferTransactionsGroupedDto } from '../../utils/types/offerTransactionGroupedDto';
import { Image } from 'react-native';

jest.mock('../../assets/icons/coins.svg', () => 'CoinsIcon');

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

jest.mock('../../utils/constants/constants', () => ({
	OFFER_TYPES_IMAGES: [
		'grantImageMock',
		'percentageImageMock',
		'bogoImageMock',
		'cashImageMock',
		'freeEntryImageMock',
		'otherImageMock'
	]
}));

describe('TransactionItem', () => {
	const mockTransaction: OfferTransactionsGroupedDto = {
		offerTitle: 'Awesome Deal',
		supplierName: 'Best Supplier',
		amount: 123.45,
		createdDate: '02-04-2025',
		offerType: {
			offerTypeId: 2,
			offerTypeLabel: 'offer.types.discount'
		}
	};

	it('renders transaction data correctly', () => {
		const { getByText } = render(<TransactionItem transaction={mockTransaction} />);

		expect(getByText('Awesome Deal')).toBeTruthy();
		expect(getByText('Best Supplier')).toBeTruthy();
		expect(getByText('02-04-2025')).toBeTruthy();
		expect(getByText('-')).toBeTruthy();
		expect(getByText('123.45')).toBeTruthy();
	});

	it('displays the correct icon based on offerTypeId', () => {
		const { UNSAFE_getByType } = render(<TransactionItem transaction={mockTransaction} />);
		const image = UNSAFE_getByType(Image);
		expect(image.props['source']).toBe('percentageImageMock');
	});
});
