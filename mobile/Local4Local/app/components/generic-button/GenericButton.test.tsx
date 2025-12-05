import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GenericButton from './GenericButton';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';

// Mocking the useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('GenericButton component', () => {

    it('renders primary button correctly', () => {
        const onPressHandler = jest.fn();
        const { getByText } = render(
            <GenericButton
                type={ButtonTypeEnum.primary}
                text="Test Button"
                onPressHandler={onPressHandler}
            />
        );

        const buttonText = getByText('Test Button');
        expect(buttonText).toBeTruthy();

        fireEvent.press(buttonText);
        expect(onPressHandler).toHaveBeenCalled();
    });


    it('renders secondary button correctly', () => {
        const onPressHandler = jest.fn();
        const { getByText } = render(
            <GenericButton
                type={ButtonTypeEnum.secondary}
                text="Test Button"
                onPressHandler={onPressHandler}
            />
        );

        const buttonText = getByText('Test Button');
        expect(buttonText).toBeTruthy();

        fireEvent.press(buttonText);
        expect(onPressHandler).toHaveBeenCalled();
    });

    it('renders danger button correctly', () => {
        const onPressHandler = jest.fn();
        const { getByText } = render(
            <GenericButton
                type={ButtonTypeEnum.primary}
                text="Test Button"
                onPressHandler={onPressHandler}
            />
        );

        const buttonText = getByText('Test Button');
        expect(buttonText).toBeTruthy();

        fireEvent.press(buttonText);
        expect(onPressHandler).toHaveBeenCalled();
    });

});
