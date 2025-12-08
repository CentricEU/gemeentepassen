import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Alert, Linking, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { DEFAULT_COORDINATES } from '../constants/mapConstants';

export default class GeolocationUtils {
	static requestLocationPermission = async () => {
		let permission;

		if (Platform.OS === 'android') {
			permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
		} else if (Platform.OS === 'ios') {
			permission = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
			if (permission === RESULTS.BLOCKED) {
				permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
			}
		}

		return permission;
	};

	static toRadians = (degrees: number) => {
		return (degrees * Math.PI) / 180;
	};

	static computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
		const R = 6371;
		const dLat = GeolocationUtils.toRadians(lat2 - lat1);
		const dLon = GeolocationUtils.toRadians(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(GeolocationUtils.toRadians(lat1)) *
				Math.cos(GeolocationUtils.toRadians(lat2)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;
		return distance;
	};

	static watchCurrentLocation = async (setLocation: any) => {
		const permission = await GeolocationUtils.requestLocationPermission();

		if (permission === RESULTS.GRANTED) {
			const watchId = Geolocation.watchPosition(
				(position) => {
					setLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					});
				},
				(error) => {
					setLocation(DEFAULT_COORDINATES);
				},
				{ enableHighAccuracy: true, distanceFilter: 0, interval: 5000, fastestInterval: 2000 }
			);
			return watchId;
		} else if (permission === RESULTS.BLOCKED) {
			Alert.alert('Permission blocked', 'Please access your settings to give location permission.', [
				{
					text: 'Open Settings',
					onPress: () => Linking.openSettings()
				}
			]);
		} else {
			Alert.alert('Permission denied', 'Without your permission, Gemeentepassen App can not access your location.', [
				{
					text: 'Try Again',
					onPress: () => GeolocationUtils.watchCurrentLocation(setLocation)
				}
			]);
		}
		setLocation(DEFAULT_COORDINATES);

		return null;
	};

	static clearWatch = (watchId: any) => {
		watchId && Geolocation.clearWatch(watchId);
	};
}
