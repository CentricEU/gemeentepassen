import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from './SearchBar';


jest.mock("../../assets/icons/filter_b.svg", () => "FilterBoldIcon");
jest.mock('../../components/search-bar/SearchBar', () => require('../../../__mocks__/SearchBar'));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('SearchBar Component', () => {
    it('renders correctly', () => {
        const { getByTestId, getByPlaceholderText } = render(<SearchBar value="" changeTextHandler={() => { }} />);

        const searchbar = getByTestId('mock-search-bar');
        expect(searchbar).toBeDefined();

        const placeholderText = getByPlaceholderText('Enter search here');
        expect(placeholderText).toBeDefined();
    });

    it('calls changeTextHandler on text change', () => {
        const changeText = jest.fn();
        const { getByTestId } = render(<SearchBar value="" changeTextHandler={changeText} />);

        const searchbar = getByTestId('mock-search-bar');
        fireEvent.changeText(searchbar, 'new text');

        // Check if changeTextHandler is called with the correct value
        expect(changeText).toHaveBeenCalledWith('new text');
    });
});
