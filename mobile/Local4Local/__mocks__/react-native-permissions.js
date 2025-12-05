export const RESULTS = {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    GRANTED: 'granted',
  };
  
  export const PERMISSIONS = {
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    IOS: {
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
  };
  
  export const request = jest.fn().mockResolvedValue(RESULTS.GRANTED);
  export const check = jest.fn().mockResolvedValue(RESULTS.GRANTED);
  