import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Map from './Map';
import OfferService from '../../services/OfferService';
import { Text, View, Keyboard } from 'react-native';

jest.mock('react-native-maps', () => {
	const React = require('react');
	const { View } = require('react-native');

	const MockMapView = React.forwardRef(
		(
			{ children }: { children?: React.ReactNode },
			ref: React.Ref<any>
		) => {
			return <View ref={ref} testID="map">{children}</View>;
		}
	);

	return {
		__esModule: true,
		default: MockMapView,
		PROVIDER_GOOGLE: 'PROVIDER_GOOGLE'
	};
});


const dismissSpy = jest.spyOn(Keyboard, 'dismiss');

jest.mock('../customMarker/CustomMarker', () => {
	return {
		__esModule: true,
		default: ({ offer, offerGroup }: any) => {
			if (offer) {
				return <View><Text>{offer.title}</Text></View>;
			}
			if (offerGroup) {
				return (
					<View>
						{offerGroup.map((o: any) => (
							<Text key={o.id}>{o.title}</Text>
						))}
					</View>
				);
			}
			return null;
		}
	};
});


jest.mock('../../services/OfferService', () => ({
	getMapOffersWithViewport: jest.fn()
}));

const mockOffersMap = {
	'40.7128,-74.0060': [
		{
			id: '1',
			coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.006 }),
			title: 'Single Offer',
			description: 'Description',
			offerType: { offerTypeId: '1' }
		}
	],
	'40.7128,-74.0061': [
		{
			id: '2',
			coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0061 }),
			title: 'Grouped Offer 1',
			description: 'Description',
			offerType: { offerTypeId: '2' }
		},
		{
			id: '3',
			coordinatesString: JSON.stringify({ latitude: 40.7128, longitude: -74.0061 }),
			title: 'Grouped Offer 2',
			description: 'Description',
			offerType: { offerTypeId: '2' }
		}
	]
};

const currentLocation = { latitude: 40.7128, longitude: -74.006 };

const renderComponent = () => {
	return render(<Map currentLocation={currentLocation} />);
};

describe('Map', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		(OfferService.getMapOffersWithViewport as jest.Mock).mockResolvedValue(mockOffersMap);
	});

	test('renders map and markers correctly', async () => {
		const { findByText, getByTestId } = renderComponent();

		expect(getByTestId('map')).toBeTruthy();

		const singleOffer = await findByText('Single Offer');
		expect(singleOffer).toBeTruthy();
	});


	test('handles region changes and dismisses keyboard', async () => {
		const { getByTestId } = renderComponent();
		const map = getByTestId('map');

		fireEvent(map, 'onRegionChangeComplete', { latitude: 40.7138, longitude: -74.007 });

		fireEvent.press(map);

		await waitFor(() => {
			expect(dismissSpy).toHaveBeenCalled();
		});
	});

	test('fetches map offers on region change', async () => {
		const getMapOffersWithViewportSpy = jest.spyOn(OfferService, 'getMapOffersWithViewport');

		const { getByTestId } = renderComponent();
		const map = getByTestId('map');

		fireEvent(map, 'onRegionChangeComplete', { latitude: 40.7138, longitude: -74.007 });

		await waitFor(() => {
			expect(getMapOffersWithViewportSpy).toHaveBeenCalled();
		});
	});
});
