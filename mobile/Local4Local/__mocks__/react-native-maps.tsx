
import React from 'react';
import { View } from 'react-native';

const MockMapView = (props: any) => {
  return <View {...props} testID="mock-map-view" />;
};

export const PROVIDER_GOOGLE = 'google';

export default MockMapView;
