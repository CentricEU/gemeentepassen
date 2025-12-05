import 'react-native-gesture-handler/jestSetup';
import { NativeModules } from 'react-native';

NativeModules.RNPermissions = {
  ...NativeModules.RNPermissions,
};

global.window = {}
global.window = global

jest.mock('react-native-permissions', () => {
  const actualPermissions = jest.requireActual('react-native-permissions');
  return {
    __esModule: true,
    ...actualPermissions,
    request: jest.fn(() => Promise.resolve('granted')),
    check: jest.fn(() => Promise.resolve('granted')),
    RESULTS: {
      UNAVAILABLE: 'unavailable',
      DENIED: 'denied',
      BLOCKED: 'blocked',
      GRANTED: 'granted',
    },
    PERMISSIONS: {
      ANDROID: {
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      },
      IOS: {
        LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      },
    },
  };
});
