import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Login } from './Login';
import { TouchableOpacity, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';

jest.mock('../../components/login-form/LoginForm', () => ({
    __esModule: true,
    default: () => <View testID="LoginForm">Mocked LoginForm</View>,
}));

jest.mock('../../components/error-toaster/CustomToaster', () => ({
    __esModule: true,
    default: ({ message, onClose }: any) => (
        <TouchableOpacity onPress={onClose} testID="CloseButton">
            <View testID="CustomToaster">
                {message}
            </View>
        </TouchableOpacity>
    ),
}));

const mockNavigation: StackNavigationProp<RootStackParamList> = {
    navigate: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
    canGoBack: jest.fn(() => false),
    isFocused: jest.fn(() => true),
    setOptions: jest.fn(),
} as any;

const mockRoute: RouteProp<RootStackParamList, 'Login'> = {
    key: 'mock-key',
    name: 'Login',
    params: {},
};

describe('Login', () => {
    it('should render the ImageBackground and main container', () => {
        const { getByTestId } = render(
            <PaperProvider>
                <Login navigation={mockNavigation} route={mockRoute} />
            </PaperProvider>
        );

        expect(getByTestId('mainContainer')).toBeTruthy();
    });

    it('should render the LoginForm component', () => {
        const { getByTestId } = render(
            <PaperProvider>
                <Login navigation={mockNavigation} route={mockRoute} />
            </PaperProvider>
        );

        expect(getByTestId('LoginForm')).toBeTruthy();
    });

    it('should render the CustomToaster component when requestError is set', async () => {
        const routeWithError = {
            ...mockRoute,
            params: { errorCode: '40027' },
        };
    
        const { findByTestId, getByTestId } = render(
            <PaperProvider>
                <Login navigation={mockNavigation} route={routeWithError} />
            </PaperProvider>
        );
    
        const toasterElement = await findByTestId('CustomToaster');
        expect(toasterElement).toBeTruthy();
    
        fireEvent.press(getByTestId('CloseButton'));

        await waitFor(() => {
            expect(screen.queryByTestId('CustomToaster')).toBeNull();
        });
    });
    
});
