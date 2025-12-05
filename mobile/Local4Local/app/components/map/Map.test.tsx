import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Map from './Map';
import OfferService from '../../services/OfferService';
import { View } from 'react-native';
import { Keyboard } from 'react-native';

jest.mock('react-native-maps', () => ({
    __esModule: true,
    default: jest.fn(({ children, ...props }) => (
        <div testID="map" {...props}>{children}</div>
    )),
    PROVIDER_GOOGLE: 'PROVIDER_GOOGLE',
}));

const dismissSpy = jest.spyOn(Keyboard, 'dismiss');


jest.mock('../customMarker/CustomMarker', () => {
    return {
        CustomMarker: jest.fn(({ testID, children, coordinate, key }) => (
            <View testID={testID}>
                {coordinate}
                {children}
                {key}
                {testID}
            </View>
        )),
    };
});

jest.mock('../../services/OfferService', () => ({
    getMapOffersWithViewport: jest.fn(),
}));

const mockOffersMap = {
    '40.7128,-74.0060': [
        {
            id: '1',
            coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
            title: 'Single Offer',
            description: 'Description',
            offerType: { offerTypeId: '1' },
        }
    ],
    '40.7128,-74.0061': [
        {
            id: '2',
            coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0061 }),
            title: 'Grouped Offer 1',
            description: 'Description',
            offerType: { offerTypeId: '2' },
        },
        {
            id: '3',
            coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0061 }),
            title: 'Grouped Offer 2',
            description: 'Description',
            offerType: { offerTypeId: '2' },
        }
    ]
};

const currentLocation = { latitude: 40.7128, longitude: -74.0060 };

const renderComponent = () => {
    return render(<Map currentLocation={currentLocation} />);
};


describe('Map', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (OfferService.getMapOffersWithViewport as jest.Mock).mockResolvedValue(mockOffersMap);
    });

    test('renders map and markers correctly', async () => {
        const { getByTestId, findByText } = renderComponent();

        expect(getByTestId('map')).toBeTruthy();

        await waitFor(() => {
            expect(findByText('Single Offer')).resolves.toBeTruthy();
        });

        await waitFor(() => {
            expect(findByText('Grouped Offer 1')).resolves.toBeTruthy();
            expect(findByText('Grouped Offer 2')).resolves.toBeTruthy();
        });
    });

    test('handles region changes and dismisses keyboard', async () => {
        const { getByTestId } = renderComponent();
        const map = getByTestId('map');

        fireEvent(map, 'onRegionChangeComplete', { latitude: 40.7138, longitude: -74.0070 });

        fireEvent.press(map);

        await waitFor(() => {
            expect(dismissSpy).toHaveBeenCalled();
        });
    });

    test('fetches map offers on region change', async () => {
        const getMapOffersWithViewportSpy = jest.spyOn(OfferService, 'getMapOffersWithViewport');

        const { getByTestId } = renderComponent();
        const map = getByTestId('map');

        fireEvent(map, 'onRegionChangeComplete', { latitude: 40.7138, longitude: -74.0070 });

        await waitFor(() => {
            expect(getMapOffersWithViewportSpy).toHaveBeenCalled();
        });
    });
});
