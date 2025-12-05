import { render, fireEvent } from '@testing-library/react-native';
import { ChangeLanguage } from './ChangeLanguage';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: any) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock("../../assets/icons/flag-nl.svg", () => "NlFlag");
jest.mock("../../assets/icons/flag-en.svg", () => "EnFlag");

describe('ChangeLanguage component', () => {
  test('renders language options correctly', () => {
    const navigation: any = { navigate: jest.fn() };
    const { getByText } = render(<ChangeLanguage navigation={navigation} />);
    expect(getByText('profile.language.en')).toBeTruthy();
    expect(getByText('profile.language.nl')).toBeTruthy();
  });

  test('renders the check icon for the current language', () => {
    const navigation: any = { navigate: jest.fn() };
    const { getByTestId, queryByTestId } = render(<ChangeLanguage navigation={navigation} />);
    
    fireEvent.press(getByTestId('button-nl'));
    expect(queryByTestId('checked-icon')).toBeDefined();
  });

});
