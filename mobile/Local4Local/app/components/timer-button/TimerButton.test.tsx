import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import TimerButton from './TimerButton';

jest.mock('../../services/UserService', () => ({
    __esModule: true,
    default: {
    },
}));

describe('TimerButton component', () => {
    it('renders with initial state', () => {
        const { getByText } = render(<TimerButton buttonText="Start" />);
        expect(getByText('Start (60s)')).toBeTruthy();
    });

    it('updates remaining time correctly over time', async () => {
        jest.useFakeTimers(); 
        const { getByText } = render(<TimerButton buttonText="Resend email" />);
        
        await waitFor(() => jest.advanceTimersByTime(1000));
        expect(getByText('Resend email (59s)')).toBeTruthy();
        
        await waitFor(() => jest.advanceTimersByTime(1000));
        expect(getByText('Resend email (58s)')).toBeTruthy();
        
        await waitFor(() => jest.advanceTimersByTime(58000));
        expect(getByText('Resend email')).toBeTruthy();
    });
    
});
