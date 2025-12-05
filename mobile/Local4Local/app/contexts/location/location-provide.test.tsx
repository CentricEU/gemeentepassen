import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { DEFAULT_COORDINATES } from '../../utils/constants/mapConstants';
import GeolocationUtils from '../../utils/geolocation/GeolocationUtils';
import { LocationContext, LocationProvider } from './location-provider';
import { Text } from 'react-native-paper';
import { Button } from 'react-native';

jest.mock('../../utils/geolocation/GeolocationUtils');

const mockWatchCurrentLocation = GeolocationUtils.watchCurrentLocation as jest.Mock;
const mockClearWatch = GeolocationUtils.clearWatch as jest.Mock;

describe('LocationProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates location when setLocation is called', async () => {
        const newLocation = { latitude: 10, longitude: 10 };

        const { getByTestId } = render(
            <LocationProvider>
                <LocationContext.Consumer>
                    {({ location, setLocation }) => (
                        <div>
                            <Text testID="location">{JSON.stringify(location)}</Text>
                            <Button
                                testID="updateLocation"
                                onPress={() => setLocation(newLocation)}
                                title="Update Location"
                            />
                        </div>
                    )}
                </LocationContext.Consumer>
            </LocationProvider>
        );

        const button = getByTestId('updateLocation');
        act(() => {
            button.props['onClick']();
        });

        const location = getByTestId('location');
        expect(location.props['children']).toBe(JSON.stringify(newLocation));
    });

    it('clears watch when handleClearWatch is called', async () => {
        const watchId = 1;
        mockWatchCurrentLocation.mockResolvedValue(watchId);

        const { getByTestId } = render(
            <LocationProvider>
                <LocationContext.Consumer>
                    {({ handleClearWatch }) => (
                        <Button
                            testID="clearWatch"
                            onPress={handleClearWatch}
                            title="Clear Watch"
                        />
                    )}
                </LocationContext.Consumer>
            </LocationProvider>
        );

        await waitFor(() => expect(mockWatchCurrentLocation).toHaveBeenCalled());

        const button = getByTestId('clearWatch');
        act(() => {
            button.props['onClick']();
        });

        expect(mockClearWatch).toHaveBeenCalledWith(watchId);
    });
});
