import {LatLng} from "react-native-maps";

export const DEFAULT_LONGITUDE = 4.89;
export const DEFAULT_LATITUDE = 52.37;
export const DEFAULT_COORDINATES: LatLng = {
	latitude: DEFAULT_LATITUDE,
	longitude: DEFAULT_LONGITUDE
};
export const LATITUDE_DELTA = 0.05;
export const LONGITUDE_DELTA = 0.04;
export const MAX_ZOOM_LEVEL = 1;

export const MAP_STYLE = [
	{
		"featureType": "poi",
		"elementType": "labels.icon",
		"stylers": [
			{
				"saturation": -50
			},
			{
				"lightness": 40
			}
		]
	},
	{
		"featureType": "poi",
		"elementType": "labels.text",
		"stylers": [
			{
				"saturation": -50
			},
			{
				"lightness": 40
			}
		]
	},
	{
		"featureType": "transit",
		"elementType": "labels.icon",
		"stylers": [
			{
				"saturation": -50
			},
			{
				"lightness": 40
			}
		]
	}
];

export const MARKER_IMAGES = [
	require('../../assets/markers/grant.png'),
	require('../../assets/markers/percentage.png'),
	require('../../assets/markers/bogo.png'),
	require('../../assets/markers/cash.png'),
	require('../../assets/markers/freeEntry.png'),
	require('../../assets/markers/other.png'),

];
