import { render, fireEvent } from '@testing-library/react-native';
import DiscountCodeService from '../../services/DiscountCodeService';
import { NavigationContainer } from '@react-navigation/native';
import { Discounts } from './DiscountsScreen';

jest.mock('../../assets/icons/coins.svg', () => 'CoinsIcon');
jest.mock('../../assets/icons/no-data.svg', () => 'EmptyState');

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

jest.mock('../../services/DiscountCodeService', () => ({
	getAllDiscountCodes: jest.fn()
}));
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: jest.fn((callback) => callback())
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: any) => key
	})
}));

jest.mock('@react-navigation/stack', () => {
	return {
		createStackNavigator: jest.fn(() => ({
			Screen: jest.fn(),
			Navigator: jest.fn()
		}))
	};
});

describe('DiscountsScreen', () => {
	const navigation: any = { navigate: jest.fn() };

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders empty state when there are no discount codes', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: []
			});

			const { getByTestId } = render(
				<NavigationContainer>
					<Discounts navigation={{ navigate: navigation }} />
				</NavigationContainer>
			);

			expect(getByTestId('no-discounts-title')).toBeTruthy();
			expect(getByTestId('no-discounts-description')).toBeTruthy();
		});
	});

	it('renders active and inactive discount codes', async () => {
		await (async () => {
			const mockActiveDiscounts = [{ code: 'ACTIVE1' }];
			const mockInactiveDiscounts = [{ code: 'INACTIVE1' }];

			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: mockActiveDiscounts,
				inactive: mockInactiveDiscounts
			});

			const { getByText } = render(
				<NavigationContainer>
					<Discounts navigation={{ navigate: navigation }} />
				</NavigationContainer>
			);

			expect(getByText('discounts.activeDiscounts')).toBeTruthy();
			expect(getByText('discounts.expiredDiscounts')).toBeTruthy();
		});
	});

	it('navigates to OffersStack when explore offers button is pressed', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: []
			});

			const { getByText } = render(<Discounts navigation={{ navigate: navigation }} />);

			fireEvent.press(getByText('generic.buttons.exploreOffers'));
			expect(navigation).toHaveBeenCalledWith('OffersStack');
		});
	});

	it('renders search bar correctly', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: []
			});

			const { getByPlaceholderText } = render(<Discounts navigation={{ navigate: navigation }} />);

			expect(getByPlaceholderText('search.searchBarTextDiscounts')).toBeTruthy();
		});
	});

	it('renders active discount codes correctly', async () => {
		await (async () => {
			const mockActiveDiscounts = [{ code: 'ACTIVE1' }];

			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: mockActiveDiscounts,
				inactive: []
			});

			const { getByText } = render(<Discounts navigation={{ navigate: navigation }} />);

			expect(getByText('discounts.activeDiscounts')).toBeTruthy();
			expect(getByText('ACTIVE1')).toBeTruthy();
		});
	});

	it('renders inactive discount codes correctly', async () => {
		await (async () => {
			const mockInactiveDiscounts = [{ code: 'INACTIVE1' }];

			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: mockInactiveDiscounts
			});

			const { getByText } = render(<Discounts navigation={{ navigate: navigation }} />);

			expect(getByText('discounts.expiredDiscounts')).toBeTruthy();
			expect(getByText('INACTIVE1')).toBeTruthy();
		});
	});

	it('renders no active discounts message when there are no active discount codes', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: [{ code: 'INACTIVE1' }]
			});

			const { getByText } = render(<Discounts navigation={{ navigate: navigation }} />);

			expect(getByText('discounts.noActiveDiscounts')).toBeTruthy();
		});
	});

	it('renders no expired discounts message when there are no inactive discount codes', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [{ code: 'ACTIVE1' }],
				inactive: []
			});

			const { getByText } = render(<Discounts navigation={{ navigate: navigation }} />);

			expect(getByText('discounts.noExpiredDiscounts')).toBeTruthy();
		});
	});

	it('updates search query state when text is entered in search bar', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: []
			});

			const { getByPlaceholderText } = render(<Discounts navigation={{ navigate: navigation }} />);

			const searchBar = getByPlaceholderText('search.searchBarTextDiscounts');
			fireEvent.changeText(searchBar, 'new search query');

			expect(searchBar.props['value']).toBe('new search query');
		});
	});

	it('fetches discount codes on focus', async () => {
		await (async () => {
			const mockActiveDiscounts = [{ code: 'ACTIVE1' }];
			const mockInactiveDiscounts = [{ code: 'INACTIVE1' }];

			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: mockActiveDiscounts,
				inactive: mockInactiveDiscounts
			});

			const { getByText } = render(
				<NavigationContainer>
					<Discounts navigation={{ navigate: navigation }} />
				</NavigationContainer>
			);

			expect(getByText('ACTIVE1')).toBeTruthy();
			expect(getByText('INACTIVE1')).toBeTruthy();
		});
	});

	it('renders empty state when there are no discount codes', async () => {
		await (async () => {
			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: [],
				inactive: []
			});

			const { getByTestId } = render(
				<NavigationContainer>
					<Discounts navigation={{ navigate: navigation }} />
				</NavigationContainer>
			);

			expect(getByTestId('no-discounts-title')).toBeTruthy();
			expect(getByTestId('no-discounts-description')).toBeTruthy();
		});
	});

	it('renders discount lists correctly', async () => {
		await (async () => {
			const mockActiveDiscounts = [{ code: 'ACTIVE1' }];
			const mockInactiveDiscounts = [{ code: 'INACTIVE1' }];

			(DiscountCodeService.getAllDiscountCodes as jest.Mock).mockResolvedValueOnce({
				active: mockActiveDiscounts,
				inactive: mockInactiveDiscounts
			});

			const { getByText } = render(
				<NavigationContainer>
					<Discounts navigation={{ navigate: navigation }} />
				</NavigationContainer>
			);

			expect(getByText('discounts.activeDiscounts')).toBeTruthy();
			expect(getByText('ACTIVE1')).toBeTruthy();
			expect(getByText('discounts.expiredDiscounts')).toBeTruthy();
			expect(getByText('INACTIVE1')).toBeTruthy();
		});
	});
});
