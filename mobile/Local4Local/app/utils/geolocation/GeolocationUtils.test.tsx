import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { Alert, Linking, Platform } from 'react-native';
import GeolocationUtils from './GeolocationUtils';
import { DEFAULT_COORDINATES } from '../constants/mapConstants';

jest.mock('react-native-permissions', () => ({
    check: jest.fn(),
    request: jest.fn(),
    RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        BLOCKED: 'blocked'
    },
    PERMISSIONS: {
        ANDROID: {
            ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        },
        IOS: {
            LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
            LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
        },
    }
}));

jest.mock('react-native-geolocation-service', () => ({
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'android' },
    Alert: { alert: jest.fn() },
    Linking: { openSettings: jest.fn() }
}));

describe('GeolocationUtils', () => {
    describe('requestLocationPermission', () => {
        test('requests location permission on Android', async () => {
            Platform.OS = 'android';
            (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

            const permission = await GeolocationUtils.requestLocationPermission();
            expect(request).toHaveBeenCalledWith(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            expect(permission).toBe(RESULTS.GRANTED);
        });

        test('requests location permission on iOS and checks secondary permission if blocked', async () => {
            Platform.OS = 'ios';
            (request as jest.Mock)
                .mockResolvedValueOnce(RESULTS.BLOCKED)
                .mockResolvedValueOnce(RESULTS.GRANTED);
            (check as jest.Mock).mockResolvedValueOnce(RESULTS.GRANTED);

            const permission = await GeolocationUtils.requestLocationPermission();
            expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.LOCATION_ALWAYS);
            expect(check).toHaveBeenCalledWith(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            expect(permission).toBe(RESULTS.GRANTED);
        });
    });

    describe('toRadians', () => {
        test('converts degrees to radians', () => {
            const degrees = 180;
            const radians = GeolocationUtils.toRadians(degrees);
            expect(radians).toBe(Math.PI);
        });
    });

    describe('computeDistance', () => {
        test('computes distance between two coordinates', () => {
            const distance = GeolocationUtils.computeDistance(0, 0, 0, 1);
            expect(distance).toBeCloseTo(111.19, 2); // Approximate distance between longitude 0 and 1 degree
        });
    });

    describe('watchCurrentLocation', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('sets location when permission is granted', async () => {
            const setLocation = jest.fn();
            (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

            (Geolocation.watchPosition as jest.Mock).mockImplementation((success: any) => {
                success({
                    coords: { latitude: 1, longitude: 1 },
                });
            });

            await GeolocationUtils.watchCurrentLocation(setLocation);
            expect(setLocation).toHaveBeenCalledWith({
                latitude: 1,
                longitude: 1,
            });
        });

        test('alerts when permission is denied and retries', async () => {
            const setLocation = jest.fn();
            (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);

            await GeolocationUtils.watchCurrentLocation(setLocation);
            expect(Alert.alert).toHaveBeenCalledWith(
                'Permission denied',
                'Without your permission, Gemeentepassen App can not access your location.',
                [{ text: 'Try Again', onPress: expect.any(Function) }]
            );
        });


        test('sets default location and alerts when an error occurs while getting location', async () => {
            const setLocation = jest.fn();
            (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

            (Geolocation.watchPosition as jest.Mock).mockImplementation((success: any, error: any) => {
                error();
            });

            await GeolocationUtils.watchCurrentLocation(setLocation);
            expect(setLocation).toHaveBeenCalledWith(DEFAULT_COORDINATES);
            expect(Alert.alert).toHaveBeenCalledWith('Encountered an error while getting location.');
        });
    });

    describe('clearWatch', () => {
        test('clears the watch when watchId is provided', () => {
            const watchId = 1;
            GeolocationUtils.clearWatch(watchId);
            expect(Geolocation.clearWatch).toHaveBeenCalledWith(watchId);
        });
    });
});
