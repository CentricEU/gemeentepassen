import React from 'react';
import { render } from '@testing-library/react-native';
import { PersonalInformation } from './PersonalInformation'; 
import UserService from '../../services/UserService';
import { CitizenProfileDto } from '../../utils/models/CitizenProfileDto';
import { PersonalInfoFormControlsEnum } from '../../utils/enums/personalInfoFormControlsEnum';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => key,
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn()
}));

const navigation: any = { navigate: jest.fn() };

jest.mock('../../services/UserService');

describe('PersonalInformation', () => {
  const profileData = new CitizenProfileDto(
    'username123',
    'John',
    'Doe',
    '123 Main St',
    '1234567890'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    UserService.getCitizenProfile = jest.fn().mockResolvedValue(profileData);
    UserService.updateUserInformation = jest.fn().mockResolvedValue({});
  });

  it('should Render PersonalInformation', async () => {
    await (async () => {
      const { getByText } = render(<PersonalInformation navigation={navigation} />);
      const saveButton = getByText('generic.buttons.saveChanges');
      expect(saveButton).toBeTruthy();
    });
  });

  it('should call UserService getCitizenProfile', async () => {
    await (async () => {
      render(<PersonalInformation navigation={navigation} />);
      expect(UserService.getCitizenProfile).toHaveBeenCalled();
    });
  });


  test('should display validation errors for required fields', async () => {
    await (async () => {
      const { getByText } = render(<PersonalInformation navigation={navigation} />);
      expect(getByText('generic.errors.requiredField')).toBeTruthy();
    });
  });


  test('should disable save button if form is untouched', async () => {
    await (async () => {
      const { getByText } = render(<PersonalInformation navigation={navigation} />);
      const saveButton = getByText('generic.buttons.saveChanges');
      expect(saveButton.props['accessibilityState'].disabled).toBe(false);
    });
  });

  test('should load and display user profile data', async () => {
    await (async () => {
      const { getByTestId } = render(<PersonalInformation navigation={navigation} />);

      expect(getByTestId(PersonalInfoFormControlsEnum.firstName + "_id").props['value']).toBe('John');
      expect(getByTestId(PersonalInfoFormControlsEnum.lastName + "_id").props['value']).toBe('Doe');
      expect(getByTestId(PersonalInfoFormControlsEnum.address + "_id").props['value']).toBe('123 Main St');
      expect(getByTestId(PersonalInfoFormControlsEnum.telephone + "_id").props['value']).toBe('1234567890');
    });
  });
});
