
import React from 'react';
import { Searchbar } from 'react-native-paper';

const MockSearchBar = ({ value, changeTextHandler }: { value: string, changeTextHandler: (text: string) => void }) => {
    return (
        <div data-testid="mock-search-bar">
            <Searchbar value={value}
                placeholder="Enter search here"
                testID="mock-search-bar"
                onChangeText={changeTextHandler}
            ></Searchbar>

            <button onClick={() => console.log('Filter button clicked')} >
                Filter
            </button>
        </div>
    );
};

export default MockSearchBar;
