import { Dimensions } from 'react-native';
import { Keyboard, KeyboardEvent } from 'react-native';
import { useEffect, useState } from 'react';
import { NavigationState } from '@react-navigation/native';

export const isTablet = () => {
	const { width } = Dimensions.get('window');
	return width >= 768;
};

export const useKeyboard = () => {
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		const show = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
			setKeyboardHeight(e.endCoordinates.height);
		});

		const hide = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardHeight(0);
		});

		return () => {
			show.remove();
			hide.remove();
		};
	}, []);

	return keyboardHeight;
};

export const getCurrentRouteName = (state?: NavigationState): string | undefined => {
	if (!state || !state.routes || state.index == null) {
		return undefined;
	}

	const route = state.routes[state.index];

	if (route.state) {
		return getCurrentRouteName(route.state as NavigationState);
	}

	return route.name;
};
