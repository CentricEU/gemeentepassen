import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Profile } from './ProfileScreen';
import { CitizenProfileDto } from '../../utils/models/CitizenProfileDto';
import UserService from "../../../__mocks__/UserService";
import { Provider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../../services/UserService', () => require('../../../__mocks__/UserService'));
jest.mock("../../assets/icons/coins.svg", () => "CoinsIcon");
jest.mock("../../assets/icons/chevron-large-left_r.svg", () => "ArrowLeftRegularIcon");
jest.mock("../../assets/icons/chevron-large-right_r.svg", () => "ArrowRightRegularIcon");
jest.mock("../../assets/icons/logout.svg", () => "<LogoutIcon");
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn()
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Profile Component', () => {

  test('renders profile information when citizen profile is available', async () => {
    let getCitizenProfile = jest.spyOn(UserService, 'getCitizenProfile');

    getCitizenProfile.mockImplementationOnce((): any => {
      return Promise.resolve(new CitizenProfileDto('username', 'firstName', 'lastName'));
    });

    const navigation: any = { navigate: jest.fn() };
    const { getByTestId } = render(


      <NavigationContainer>
        <Provider>
          <Profile navigation={navigation} />
        </Provider>
      </NavigationContainer>
    );
    await waitFor(() => {
      expect(getByTestId('user-info-container-id')).toBeTruthy();
    });

    getCitizenProfile.mockRestore();

  });

});
