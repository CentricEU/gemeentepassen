import { fireEvent, render } from '@testing-library/react-native';
import { Offers } from './OfferScreen';
import { DEFAULT_COORDINATES } from '../../utils/constants/mapConstants';
import { LatLng } from 'react-native-maps';

jest.mock("../../assets/icons/hand-euro-coin_b.svg", () => "HandEuroCoinBoldIcon");
jest.mock("../../assets/icons/percent_b.svg", () => "PercentBoldIcon");
jest.mock("../../assets/icons/plus_eb.svg", () => "PlusBoldIcon");
jest.mock("../../assets/icons/euro-coin_b.svg", () => "EuroCoinIcon");
jest.mock("../../assets/icons/list-bullet_r.svg", () => "ListBulletRegularIcon");
jest.mock("../../assets/icons/map_b.svg", () => "MapBoldIcon");

jest.mock('../../components/search-bar/SearchBar', () => require('../../../__mocks__/SearchBar'));

// Mocking GeolocationUtils
jest.mock('../../utils/geolocation/GeolocationUtils', () => ({
    watchCurrentLocation: jest.fn((callback: (location: LatLng) => void) => {
        callback(DEFAULT_COORDINATES);
    }),
}));

jest.mock('@react-navigation/stack', () => ({
    createStackNavigator: jest.fn().mockReturnValue({
        Navigator: ({ children }: any) => <>{children}</>,
        Screen: ({ name, component }: any) => component({ navigation: jest.fn(), route: { params: { offerTitle: 'Test Offer' } } })
    })
}));

jest.mock('../../components/view-mode-button/ViewModeButton', () => require('../../../__mocks__/ViewModeButton'));

describe('<Offers />', () => {
    it('renders search bar', () => {
        const { getByTestId } = render(<Offers navigation={jest.fn()} />);
        const searchBar = getByTestId('mock-search-bar');
        expect(searchBar).toBeTruthy();
    });

    it('renders map view by default', () => {
        const { getByTestId } = render(<Offers navigation={jest.fn()} />);
        const viewModeButton = getByTestId('mock-view-mode-button');
        expect(viewModeButton).toBeTruthy();
    });

    it('switches between map and list view', () => {
        const { getByTestId, queryByTestId, getByText } = render(<Offers navigation={jest.fn()} />);
        const viewModeButton = getByTestId('mock-view-mode-button');

        expect(getByText('View Mode Button')).toBeTruthy();

        fireEvent.press(viewModeButton);

        expect(queryByTestId('mock-map-view')).toBeNull();
    });
});
