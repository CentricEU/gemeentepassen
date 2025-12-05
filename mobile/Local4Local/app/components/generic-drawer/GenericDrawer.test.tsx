import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GenericDrawer from './GenericDrawer';
import GenericButton from '../generic-button/GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';


jest.mock("../../assets/icons/close.svg", () => "CloseIcon");

describe('GenericDrawer component', () => {
    test('renders correctly when visible is true', () => {
        const onCloseMock = jest.fn();
        const buttons = [
            <button key="button1">Button 1</button>,
            <button key="button2">Button 2</button>,
        ];

        const { getByText } = render(
            <GenericDrawer
                visible={true}
                description="Description"
                title="Title"
                onClose={onCloseMock}
                buttons={buttons}
            />
        );

        expect(getByText('Title')).toBeTruthy();
        expect(getByText('Description')).toBeTruthy();
    });

    test('does not render when visible is false', () => {
        const onCloseMock = jest.fn();
        const buttons = [
            <button key="button1">Button 1</button>,
            <button key="button2">Button 2</button>,
        ];

        const { queryByText } = render(
            <GenericDrawer
                visible={false}
                description="Description"
                title="Title"
                onClose={onCloseMock}
                buttons={buttons}
            />
        );

        expect(queryByText('Title')).toBeNull();
        expect(queryByText('Description')).toBeNull();
        expect(queryByText('Button 1')).toBeNull();
        expect(queryByText('Button 2')).toBeNull();
    });

    test('calls onClose when close button is pressed', () => {
        const onCloseMock = jest.fn();
        const buttons = [
            <GenericButton
                type={ButtonTypeEnum.danger}
                text="profile.logout"
                key="logout"
                onPressHandler={onCloseMock}
            />];


        const { getByTestId } = render(
            <GenericDrawer
                visible={true}
                description="Description"
                title="Title"
                onClose={onCloseMock}
                buttons={buttons}
            />
        );

        const closeButton = getByTestId('closeButton');
        fireEvent.press(closeButton);

        expect(onCloseMock).toHaveBeenCalled();
    });
});
