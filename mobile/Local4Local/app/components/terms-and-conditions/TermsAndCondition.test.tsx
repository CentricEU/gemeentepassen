import { render, fireEvent } from '@testing-library/react-native';
import TermsAndConditions from './TermsAndConditions';

jest.mock('react-native-paper', () => {
	const actualPaper = jest.requireActual('react-native-paper');
	return {
		...actualPaper,
		TextInput: {
			...actualPaper.TextInput,
			Icon: ({ icon, onPressIn, onPressOut }: any) => (
				<button data-testid="eye-icon" onMouseDown={onPressIn} onMouseUp={onPressOut}>
					{icon}
				</button>
			)
		}
	};
});


describe('TermsAndConditions', () => {
	const setTermsAndConditionView = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders all main sections', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);

		expect(getByText('privacy.intro.paragraph_1')).toBeTruthy();
		expect(getByText('privacy.promises.title')).toBeTruthy();
		expect(getByText('privacy.security.title')).toBeTruthy();
		expect(getByText('privacy.breach.title')).toBeTruthy();
		expect(getByText('privacy.rights.title')).toBeTruthy();
		expect(getByText('privacy.contact.title')).toBeTruthy();
		expect(getByText('privacy.complaint.title')).toBeTruthy();
		expect(getByText('privacy.info_sheet.title')).toBeTruthy();
	});

	it('renders all intro items', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		for (let i = 1; i <= 4; i++) {
			expect(getByText(`• privacy.intro.item_${i}`)).toBeTruthy();
		}
	});

	it('renders all promises', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		['purpose', 'basis', 'minimization', 'transparency', 'safety'].forEach(key => {
			expect(getByText(`privacy.promises.${key}.title privacy.promises.${key}.description`)).toBeTruthy();
		});
	});

	it('renders all rights', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		[
			'access',
			'correction',
			'forgotten',
			'portability',
			'restriction',
			'automated',
			'objection'
		].forEach(key => {
			expect(getByText(`privacy.rights.${key}.title privacy.rights.${key}.description`)).toBeTruthy();
		});
	});

	it('renders all info sheet items', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		for (let i = 1; i <= 6; i++) {
			expect(getByText(`• privacy.info_sheet.item_${i}`)).toBeTruthy();
		}
	});

	it('calls setTermsAndConditionView(false) when close button is pressed', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		fireEvent.press(getByText('generic.buttons.close'));
		expect(setTermsAndConditionView).toHaveBeenCalledWith(false);
	});

	it('calls Linking.openURL when email is pressed', () => {
		const { getByText } = render(
			<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
		);
		fireEvent.press(getByText('info@gemeentepassen.eu'));
		expect(require('react-native').Linking.openURL).toHaveBeenCalledWith(
			'mailto:info@gemeentepassen.eu?subject=&body='
		);
	});
});