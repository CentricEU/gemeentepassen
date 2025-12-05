import React from 'react';
import { render, act } from '@testing-library/react-native';
import { RefreshProvider, useRefresh } from './refresh-provider';

const TestComponent: React.FC<{ onRender: (context: ReturnType<typeof useRefresh>) => void }> = ({ onRender }) => {
    const context = useRefresh();
    onRender(context);
    return null;
};

describe('RefreshProvider', () => {
    it('should throw an error if useRefresh is used outside of RefreshProvider', () => {
        expect(() => render(<TestComponent onRender={() => {}} />)).toThrow('useRefresh hook must be used within a RefreshProvider');
    });

    it('should provide the correct initial context values', () => {
        let receivedContext: ReturnType<typeof useRefresh> | undefined;
        
        render(
            <RefreshProvider>
                <TestComponent onRender={(context) => { receivedContext = context; }} />
            </RefreshProvider>
        );
        
        expect(receivedContext).toBeDefined();
        expect(receivedContext?.refreshing).toBe(false);
    });

    it('should update refreshing state when startRefresh and stopRefresh are called', () => {
        let receivedContext: ReturnType<typeof useRefresh> | undefined;
        
        render(
            <RefreshProvider>
                <TestComponent onRender={(context) => { receivedContext = context; }} />
            </RefreshProvider>
        );

        act(() => {
            receivedContext?.startRefresh();
        });
        expect(receivedContext?.refreshing).toBe(true);

        act(() => {
            receivedContext?.stopRefresh();
        });
        expect(receivedContext?.refreshing).toBe(false);
    });
});
