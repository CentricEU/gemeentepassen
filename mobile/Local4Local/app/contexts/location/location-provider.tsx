import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LatLng } from 'react-native-maps';
import { DEFAULT_COORDINATES } from '../../utils/constants/mapConstants';
import GeolocationUtils from '../../utils/geolocation/GeolocationUtils';
import { RESULTS } from 'react-native-permissions';
import { checkLocationPermission } from '../../utils/permissions';
import { useTranslation } from 'react-i18next';

type LocationContextType = {
	location: LatLng | null;
	setLocation: (state: LatLng) => void;
	handleClearWatch: () => void;
};

const LocationContext = createContext<LocationContextType>({
	location: null,
	setLocation: () => {},
	handleClearWatch: () => {}
});

type LocationProviderProps = {
	children: ReactNode;
};

const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
	const { t } = useTranslation('common');
	const [location, setLocation] = useState<LatLng | null>(null);
	const [watchId, setWatchId] = useState<number | null>(null);

	useEffect(() => {
		const startWatchingLocation = async () => {
			const status = await checkLocationPermission(t);

			if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
				const id = await GeolocationUtils.watchCurrentLocation(setLocation);
				setWatchId(id ?? null);
			} else {
				setLocation(DEFAULT_COORDINATES);
			}
		};

		startWatchingLocation();

		return () => {
			if (watchId !== null) {
				GeolocationUtils.clearWatch(watchId);
			}
		};
	}, [watchId]);

	const handleClearWatch = () => {
		if (watchId !== null) {
			GeolocationUtils.clearWatch(watchId);
			setWatchId(null);
		}
	};

	return (
		<LocationContext.Provider value={{ location, setLocation, handleClearWatch }}>
			{children}
		</LocationContext.Provider>
	);
};

export { LocationContext, LocationProvider };
