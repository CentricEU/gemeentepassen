import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable } from "react-native";
import CustomToaster from './CustomToaster';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';

jest.mock("../../assets/icons/exclamation-triangle_b.svg", () => "ExclamationTriangleIcon");
jest.mock('react-native-paper', () => ({
	IconButton: jest.fn(({ onPress }: any) => (
		<Pressable testID={'close-button'} onPress={onPress}></Pressable>
	))
}));

const onClose = jest.fn();

describe('CustomToaster component', () => {
	it('renders properly', () => {
		const message = 'ErrorToasterMessage';

		const { getByText } = render(
			<CustomToaster message={message} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);

		const errorMessage = getByText(message);

		expect(errorMessage).toBeTruthy();
	});

	it('calls onClose when the close button is pressed', () => {
		const { getByTestId } = render(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);

		const closeButton = getByTestId('close-button');
		fireEvent.press(closeButton);

		expect(onClose).toHaveBeenCalled();
	});

	it('renders properly with different types', () => {
		const { getByTestId, rerender } = render(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);
		const component = getByTestId('custom-toaster');
		expect(component).toBeTruthy();

		rerender(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.INFO} />
		);
		expect(component).toBeTruthy();

		rerender(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.SUCCESS} />
		);
		expect(component).toBeTruthy();

		rerender(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.WARNING} />
		);
		expect(component).toBeTruthy();
	});

	it('renders message correctly', () => {
		const message = 'ErrorToasterMessage';
		const { getByText } = render(
			<CustomToaster message={message} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);
		const errorMessage = getByText(message);
		expect(errorMessage).toBeTruthy();
	});

	it('calls onClose when the close button is pressed', () => {
		const { getByTestId } = render(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);
		const closeButton = getByTestId('close-button');
		fireEvent.press(closeButton);
		expect(onClose).toHaveBeenCalled();
	});

	it('renders without crashing when IconComponent is not provided', () => {
		const { getByTestId } = render(
			<CustomToaster message={'message'} onClose={onClose} toasterType={ToasterTypeEnum.ERROR} />
		);
		const component = getByTestId('custom-toaster');
		expect(component).toBeTruthy();
	});
});