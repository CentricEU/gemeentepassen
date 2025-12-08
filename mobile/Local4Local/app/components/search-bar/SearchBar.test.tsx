import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from './SearchBar';

jest.mock('../../assets/icons/search_r.svg', () => 'SearchRegularIcon');
jest.mock('../../assets/icons/filter_b.svg', () => 'FilterBoldIcon');
jest.mock('../../assets/icons/clear-input.svg', () => 'ClearSearchIcon');
jest.mock('../../assets/icons/back.svg', () => 'BackArrowIcon');

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

describe('SearchBar Component', () => {
	it('renders correctly', () => {
		const { getByTestId, getByPlaceholderText } = render(
			<SearchBar value="" changeTextHandler={() => {}} placeholder="Enter search here" hideFilterButton={false} />
		);

		expect(getByTestId('mock-search-bar')).toBeDefined();
		expect(getByPlaceholderText('Enter search here')).toBeDefined();
	});

	it('calls changeTextHandler on text change', () => {
		const changeText = jest.fn();
		const { getByTestId } = render(
			<SearchBar
				value=""
				changeTextHandler={changeText}
				placeholder="search.placeholder"
				hideFilterButton={false}
			/>
		);

		fireEvent.changeText(getByTestId('mock-search-bar'), 'new text');
		expect(changeText).toHaveBeenCalledWith('new text');
	});

	it('calls onSearchPress on pressing search icon', () => {
		const onSearchPress = jest.fn();
		const { getByTestId } = render(
			<SearchBar
				value="test"
				changeTextHandler={() => {}}
				placeholder="search.placeholder"
				onSearchPress={onSearchPress}
				hideFilterButton={false}
			/>
		);

		const searchButton = getByTestId('search-icon-button');
		fireEvent.press(searchButton);
		expect(onSearchPress).toHaveBeenCalled();
	});

	it('calls clear handler when clear icon is pressed', () => {
		const changeTextHandler = jest.fn();
		const { getByTestId } = render(
			<SearchBar
				value="something"
				changeTextHandler={changeTextHandler}
				placeholder="search.placeholder"
				resetSearchBar={jest.fn()}
				hideFilterButton={false}
			/>
		);

		const clearButton = getByTestId('clear-button');
		fireEvent.press(clearButton);
		expect(changeTextHandler).toHaveBeenCalledWith('');
	});

	it('handles focus and blur events properly', () => {
		const onFocus = jest.fn();
		const onBlur = jest.fn();
		const changeTextHandler = jest.fn();
		const resetSearchBar = jest.fn();

		const setShowMinLengthWarning = jest.fn();

		const { getByTestId } = render(
			<SearchBar
				value=""
				changeTextHandler={changeTextHandler}
				placeholder="search.placeholder"
				onFocus={onFocus}
				onBlur={onBlur}
				resetSearchBar={resetSearchBar}
				hideFilterButton={false}
				setShowMinLengthWarning={setShowMinLengthWarning}
			/>
		);

		const searchbar = getByTestId('mock-search-bar');
		fireEvent(searchbar, 'focus');
		expect(onFocus).toHaveBeenCalled();

		fireEvent(searchbar, 'blur');
		expect(onBlur).toHaveBeenCalled();
		expect(changeTextHandler).toHaveBeenCalledWith('');
		expect(resetSearchBar).toHaveBeenCalled();
	});
});
