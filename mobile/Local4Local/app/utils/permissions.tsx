import { Alert, Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';

let locationDialogShown = false;

export async function checkLocationPermission(t: (key: string) => string): Promise<PermissionStatus | 'UNKNOWN'> {
	if (Platform.OS !== 'ios') return 'unavailable';

	try {
		const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

		if (status === RESULTS.BLOCKED && !locationDialogShown) {
			locationDialogShown = true;
			Alert.alert(
				t('map.locationDisabledMessage'),
				t('map.locationDisabledTitle'),
				[{ text: t('generic.buttons.ok') }],
				{ cancelable: false }
			);
		}

		return status;
	} catch (error) {
		return 'UNKNOWN';
	}
}
