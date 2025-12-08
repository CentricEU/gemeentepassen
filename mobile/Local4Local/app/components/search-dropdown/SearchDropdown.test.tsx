import { render, fireEvent } from '@testing-library/react-native';
import SearchDropdown from './SearchDropdown';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key
	})
}));

describe('SearchDropdown', () => {
	it('renders suggestions when searching and results exist', () => {
		const mockSelect = jest.fn();
		const results = ['Result 1', 'Result 2'];
		const { getByText } = render(
			<SearchDropdown results={results} history={[]} onSelectResult={mockSelect} isSearching={true} />
		);

		results.forEach((result) => {
			expect(getByText(result)).toBeTruthy();
		});
	});

	it('calls onSelectResult when a result is clicked', () => {
		const mockSelect = jest.fn();
		const results = ['Result 1'];
		const { getByText } = render(
			<SearchDropdown results={results} history={[]} onSelectResult={mockSelect} isSearching={true} />
		);

		fireEvent.press(getByText('Result 1'));
		expect(mockSelect).toHaveBeenCalledWith('Result 1');
	});

	it('renders empty fragment when searching and no results', () => {
		const { queryByText } = render(
			<SearchDropdown results={[]} history={[]} onSelectResult={() => {}} isSearching={true} />
		);

		expect(queryByText('search.gettingStarted')).toBeNull();
	});

	it("renders 'getting started' message when not searching and no history", () => {
		const { getByText } = render(
			<SearchDropdown results={[]} history={[]} onSelectResult={() => {}} isSearching={false} />
		);

		expect(getByText('search.gettingStarted')).toBeTruthy();
		expect(getByText('search.searchHistory')).toBeTruthy();
	});

	it('renders history list when not searching and history exists', () => {
		const history = ['Past 1', 'Past 2'];
		const { getByText } = render(
			<SearchDropdown results={[]} history={history} onSelectResult={() => {}} isSearching={false} />
		);

		expect(getByText('search.recent')).toBeTruthy();
		history.forEach((item) => {
			expect(getByText(item)).toBeTruthy();
		});
	});

	it('calls onSelectResult when a history item is clicked', () => {
		const mockSelect = jest.fn();
		const history = ['Past 1'];
		const { getByText } = render(
			<SearchDropdown results={[]} history={history} onSelectResult={mockSelect} isSearching={false} />
		);

		fireEvent.press(getByText('Past 1'));
		expect(mockSelect).toHaveBeenCalledWith('Past 1');
	});
});
