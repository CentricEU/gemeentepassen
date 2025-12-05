import React from 'react';
import { render } from '@testing-library/react-native';
import { usePromiseTracker } from 'react-promise-tracker';
import LoadingIndicator from './LoadingIndicator';
import { RefreshProvider } from '../../contexts/pull-to-refresh/refresh-provider';

jest.mock('react-promise-tracker', () => ({
  usePromiseTracker: jest.fn(),
}));

describe('LoadingIndicator', () => {
  const renderWithProviders = () =>
    render(
      <RefreshProvider>
        <LoadingIndicator />
      </RefreshProvider>
    );
    it("renders correctly when promise is in progress and not refreshing", () => {
      (usePromiseTracker as jest.Mock).mockReturnValue({ promiseInProgress: true });
  
      const { getByTestId } = renderWithProviders();
      const indicator = getByTestId("loading-indicator");
  
      expect(indicator).toBeTruthy();
    });
  
    it("does not render when promise is not in progress", () => {
      (usePromiseTracker as jest.Mock).mockReturnValue({ promiseInProgress: false });
  
      const { queryByTestId } = renderWithProviders();
      const indicator = queryByTestId("loading-indicator");
  
      expect(indicator).toBeNull();
    });
});
