import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ButtonWithArrow from './ButtonWithArrow';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("../../assets/icons/chevron-large-right_r.svg", () => "ArrowRightRegularIcon");

describe('ButtonWithArrow component', () => {

    it('renders ButtonWithArrow correctly', () => {
        const onPressHandler = jest.fn();
        const { getByText } = render(
            <ButtonWithArrow
                text="Test Button"
                onPressHandler={onPressHandler}
            />
        );

        const buttonText = getByText('Test Button');
        expect(buttonText).toBeTruthy();
    });


    it('calss onPressHandler to be called', () => {
        const onPressHandler = jest.fn();
        const { getByText } = render(
            <ButtonWithArrow
                text="Test Button"
                onPressHandler={onPressHandler}
            />
        );

        const buttonText = getByText('Test Button');
        fireEvent.press(buttonText);
        expect(onPressHandler).toHaveBeenCalled();
    });

});
