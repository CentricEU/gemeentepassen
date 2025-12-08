import { render } from '@testing-library/react-native';
import AuthHeader from './AuthHeader';

describe('AuthHeader', () => {
	it('renders correctly', () => {
		const { getByText } = render(
			<AuthHeader title="Title" description="Description" />
		);
		expect(getByText('Title')).toBeTruthy();
		expect(getByText('Description')).toBeTruthy();
	});
});
