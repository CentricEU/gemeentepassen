import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-native-paper';
import GenericDialog from './GenericDialog';

jest.mock('../../assets/icons/email.svg', () => 'EmailIcon');

describe('GenericDialog', () => {
    const mockOnButtonPress = jest.fn();

    const defaultProps = {
        visible: true,
        description: 'Test description',
        title: 'Test title',
        buttonText: 'Test Button',
        onButtonPress: mockOnButtonPress,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText, getByTestId, queryByText } = render(
            <Provider>
                <GenericDialog {...defaultProps} />
            </Provider>
        );

        expect(queryByText('Test description')).toBeDefined();
        expect(queryByText('Test Button (60s)')).toBeDefined();
    });

    it('does not render when visible is false', () => {
        const { queryByText } = render(
            <Provider>
                <GenericDialog {...defaultProps} visible={false} />
            </Provider>
        );


        expect(queryByText('Test title')).toBeNull();
        expect(queryByText('Test description')).toBeNull();
        expect(queryByText('Test Button (60s)')).toBeNull();
    });
});
