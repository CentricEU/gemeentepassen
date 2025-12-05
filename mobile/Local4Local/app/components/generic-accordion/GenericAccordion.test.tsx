import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GenericAccordion from './GenericAccordion';
import { Text } from 'react-native';



describe('GenericAccordion', () => {
	it('renders title correctly', () => {
		const { getByText } = render(<GenericAccordion title="Test Title"><Text>Child Content</Text></GenericAccordion>);
		expect(getByText('Test Title')).toBeTruthy();
	});

	it('toggles body content on press', () => {
		const { getByText, queryByText } = render(<GenericAccordion title="Test Title"><Text>Child Content</Text></GenericAccordion>);

		expect(queryByText('Child Content')).toBeNull();

		fireEvent.press(getByText('Test Title'));

		expect(getByText('Child Content')).toBeTruthy();

		fireEvent.press(getByText('Test Title'));

		expect(queryByText('Child Content')).toBeNull();
	});
});
