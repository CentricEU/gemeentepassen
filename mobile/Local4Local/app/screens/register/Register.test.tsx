import React from 'react';
import { render } from '@testing-library/react-native';
import { Register } from './Register';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { View } from 'react-native';

// Mock RegisterForm component
jest.mock('../../components/register-form/RegisterForm', () => {
    return {
        __esModule: true,
        default: () => <View testID="RegisterForm">Mocked RegisterForm</View>,
    };
});

type GetStartedScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Register'>;
    route: RouteProp<RootStackParamList, 'Register'>;
};

const mockNavigation: any = {
    navigate: jest.fn(),
};

const mockRoute: any = {
    params: {},
};

describe('Register', () => {
    it('should render the ImageBackground and main container', () => {
        const { getByTestId } = render(
            <Register navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByTestId('mainContainer')).toBeTruthy();
    });

    it('should render the RegisterForm component', () => {
        const { getByTestId } = render(
            <Register navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByTestId('RegisterForm')).toBeTruthy();
    });
});
