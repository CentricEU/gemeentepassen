import OffersList from './OffersList';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { CitizenOfferType } from '../../utils/enums/citizenOfferType';
import { RefreshProvider } from '../../contexts/pull-to-refresh/refresh-provider';
import { NavigationContainer } from '@react-navigation/native';
import api from '../../utils/auth/api-interceptor';
import { StatusCode } from '../../utils/enums/statusCode.enum';

// Mock the api module
jest.mock('../../utils/auth/api-interceptor', () => ({
	get: jest.fn(),
	post: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn().mockResolvedValue('mocked-token'),
	setItem: jest.fn(),
	removeItem: jest.fn()
}));

// Mock icons
jest.mock('../../assets/icons/hand-euro-coin_b.svg', () => 'HandEuroCoinBoldIcon');
jest.mock('../../assets/icons/percent_b.svg', () => 'PercentBoldIcon');
jest.mock('../../assets/icons/plus_eb.svg', () => 'PlusBoldIcon');
jest.mock('../../assets/icons/euro-coin_b.svg', () => 'EuroCoinIcon');

// Mock OfferTypeSelector component
jest.mock('../offer-type-selector/OfferTypeSelector', () => {
	return jest.fn(({ selectedType }: any) => (
		<View>
			<Text testID="offer-type-button">Selected Type: {selectedType}</Text>
		</View>
	));
});

// Mock OfferCard component
jest.mock('../offer-card/OfferCard', () => {
	return jest.fn(({ offer }: any) => (
		<View>
			<Text testID={`offer-title-${offer.id}`}>{offer.title}</Text>
		</View>
	));
});

const defaultProps = {
	currentLocation: { longitude: 45, latitude: 45 },
	selectedType: -1,
	setSelectedType: jest.fn(),
	searchKeyword: '',
	setNoOffersInList: jest.fn(),
	onResetToInitialState: jest.fn()
};

const createMockedOffer = (name: string) => ({
	id: `offerId_${name}`,
	title: `Test Offer ${name}`,
	description: `Test Description ${name}`,
	amount: 100,
	citizenOfferType: CitizenOfferType.citizenWithPass,
	offerType: {
		offerTypeId: 0,
		offerTypeLabel: 'offerLabel'
	},
	startDate: new Date(),
	expirationDate: new Date(),
	coordinatesString: '{"longitude":45, "latitude":45}',
	companyName: `Test Company ${name}`,
	distance: 10,
	grants: [],
	companyAddress: `Test Address ${name}`,
	companyLogo: `Test Logo ${name}`
});

describe('OffersList component', () => {
	it('renders the offer type buttons', async () => {
		const mockedOffers = [createMockedOffer('first')];
		(api.get as jest.Mock).mockResolvedValue({
			data: mockedOffers,
			status: StatusCode.Ok
		});
		global.fetch = jest.fn().mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockedOffers)
		});

		const { getByTestId } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList {...defaultProps} />
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => {
			const offerTypeButton = getByTestId('offer-type-button');
			expect(offerTypeButton).toBeTruthy();
		});
	});

	it('renders offers after fetching data', async () => {
		const mockedOffers = [createMockedOffer('test1'), createMockedOffer('test2')];
		(api.get as jest.Mock).mockResolvedValue({
			data: mockedOffers,
			status: StatusCode.Ok
		});
		global.fetch = jest.fn().mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockedOffers)
		});
		const { getByText } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList {...defaultProps} />
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => {
			expect(getByText('Test Offer test1')).toBeTruthy();
			expect(getByText('Test Offer test2')).toBeTruthy();
		});
	});

	it('handles API error gracefully', async () => {
		(api.get as jest.Mock).mockRejectedValue({
			response: { status: 401, data: 'Unauthorized' }
		});

		const { queryByText } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList currentLocation={{ longitude: 45, latitude: 45 }} />
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => {
			expect(queryByText('Test Offer test1')).toBeFalsy();
			expect(queryByText('Test Offer test2')).toBeFalsy();
		});
	});

	it('sets noOffersInList true if no offers and first page with empty data', async () => {
		const setNoOffersInList = jest.fn();

		global.fetch = jest.fn().mockResolvedValueOnce({
			json: jest.fn().mockResolvedValueOnce([])
		});

		render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList {...defaultProps} searchKeyword="valid" setNoOffersInList={setNoOffersInList} />
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => {
			expect(setNoOffersInList).toHaveBeenCalledWith(true);
		});
	});

	it('resets offers list when searchKeyword is valid and page is 0', async () => {
		const mockedOffers = [createMockedOffer('first')];
		(api.get as jest.Mock).mockResolvedValue({
			data: mockedOffers,
			status: StatusCode.Ok
		});
		global.fetch = jest.fn().mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValueOnce(mockedOffers)
		});

		const { getByText } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList {...defaultProps} searchKeyword="valid" setNoOffersInList={jest.fn()} />
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => {
			expect(getByText('Test Offer first')).toBeTruthy();
		});
	});
});
