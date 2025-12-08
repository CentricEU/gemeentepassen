import React from 'react';
import { render } from '@testing-library/react-native';
import { Home } from './HomeTabs';
import { View } from 'react-native';

jest.mock('react-native-permissions', () => ({
    check: jest.fn(),
    PERMISSIONS: {
        IOS: 'ios-permission',
        ANDROID: 'android-permission',
    },
    request: jest.fn(),
    RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
    },
}));

jest.mock("../../assets/icons/offer.svg", () => "OfferIcon");
jest.mock("../../assets/icons/scan.svg", () => "ScanIcon");
jest.mock("../../assets/icons/transactions.svg", () => "TransactionsIcon");
jest.mock("../../assets/icons/profile.svg", () => "ProfileIcon");
jest.mock("../../assets/icons/euro-coin_b.svg", () => "EuroCoinIcon");
jest.mock("../../assets/icons/plus_eb.svg", () => "PlusBoldIcon");
jest.mock("../../assets/icons/percent_b.svg", () => "PercentBoldIcon");
jest.mock("../../assets/icons/hand-euro-coin_b.svg", () => "HandEuroCoinBoldIcon");


jest.mock('@react-navigation/stack', () => ({
    createStackNavigator: jest.fn()
}));


jest.mock('react-native-svg', () => ({
    SvgProps: jest.fn(),
}));
jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(() => ({ t: jest.fn() })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: jest.fn(() => ({
        Navigator: ({ children }: { children: React.ReactNode }) => (
            <View testID="tab-bar">{children}</View>
        ),
        Screen: jest.fn((props) => <View testID={props.name}>{props.name}</View>),
    })),
}));

jest.mock('../offers/OfferScreen', () => ({
    OffersStack: () => <div>OffersStack</div>
}));
jest.mock('../transactions/TransactionScreen', () => ({
    TransactionsStack: () => <div>TransactionsStack</div>
}));
jest.mock('../profile/ProfileScreen', () => ({
    ProfileStack: () => <div>ProfileStack</div>
}));

jest.mock('react-native-svg', () => ({
    SvgProps: jest.fn()
}));

describe('<Home />', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<Home />);

        const tabBar = getByTestId('tab-bar');
        expect(tabBar).toBeTruthy();
    });

    it('renders all tabs', () => {
        const { getByTestId } = render(<Home />);

        expect(getByTestId('OffersStack')).toBeTruthy();
        expect(getByTestId('TransactionsStack')).toBeTruthy();
        expect(getByTestId('ProfileStack')).toBeTruthy();
    });
});
