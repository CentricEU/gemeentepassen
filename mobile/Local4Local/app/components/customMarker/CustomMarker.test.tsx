
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomMarker from './CustomMarker';
import { LocationContext } from '../../contexts/location/location-provider';
import OfferContext from '../../contexts/offer/offer-context';
import OfferService from '../../services/OfferService';
import { View } from 'react-native';

jest.mock('react-native-maps', () => {
    return {
        Marker: jest.fn(({ testID, children, coordinate, key }) => (
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
    getFullOffer: jest.fn(),
}));

const mockOffer = {
    id: '1',
    coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 }),
    title: 'Sample Offer',
    description: 'Sample Description',
    offerType: { offerTypeId: '1' },
};


const locationMock = {
    location: {
        latitude: 52.3676,
        longitude: 4.9041,
    },
    setLocation: jest.fn(),
    handleClearWatch: jest.fn(),
};

const mockOfferGroup = [mockOffer];
const mockSetOfferState = jest.fn();

const renderComponent = (props: any) => {
    return render(
        <LocationContext.Provider value={locationMock}>
            <OfferContext.Provider value={{ offerState: { offer: null, isDisplayed: false }, setOfferState: mockSetOfferState }}>
                <CustomMarker {...props} />
            </OfferContext.Provider>
        </LocationContext.Provider>
    );
};

describe('CustomMarker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        jest.useFakeTimers();
    });

    test('logs error when getFullOffer fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        (OfferService.getFullOffer as jest.Mock).mockRejectedValue(new Error('Test Error'));

        const { getByTestId } = renderComponent({ offer: mockOffer });
        fireEvent.press(getByTestId('single-offer'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Test Error'));
        });

        consoleErrorSpy.mockRestore();
    });

    test('renders a single offer marker', () => {
        const { getByTestId } = renderComponent({ offer: mockOffer });

        expect(getByTestId('single-offer')).toBeTruthy();
    });

    test('renders a group offer marker', () => {
        const { getByTestId } = renderComponent({ offerGroup: mockOfferGroup });

        expect(getByTestId('multiple-offers')).toBeTruthy();
    });

    test('calls onMarkerPressForGroupOffers when group offers marker is pressed', async () => {
        const { getByTestId } = renderComponent({ offerGroup: mockOfferGroup });

        fireEvent.press(getByTestId('multiple-offers'));

        await waitFor(() => {
            expect(OfferService.getFullOffer).not.toHaveBeenCalled();
            expect(mockSetOfferState).toHaveBeenCalledWith({
                offerGroup: mockOfferGroup,
                isDisplayed: true,
            });
        });
    });

    test('calls onMarkerPressForSingleOffer when single offer marker is pressed', async () => {
        (OfferService.getFullOffer as jest.Mock).mockResolvedValue(mockOffer);

        const { getByTestId } = renderComponent({ offer: mockOffer });
        fireEvent.press(getByTestId('single-offer'));

        await waitFor(() => {
            expect(OfferService.getFullOffer).toHaveBeenCalledWith(mockOffer.id, "52.3676", "4.9041");
        });
    });

});
