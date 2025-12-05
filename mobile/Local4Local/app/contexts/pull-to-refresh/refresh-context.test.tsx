import React, { useContext, useState } from 'react';
import { render, act } from '@testing-library/react-native';
import RefreshContext, { RefreshContextType } from './refresh-context';

const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshing, setRefreshing] = useState(false);
    
    const startRefresh = () => setRefreshing(true);
    const stopRefresh = () => setRefreshing(false);
    
    return (
        <RefreshContext.Provider value={{ refreshing, startRefresh, stopRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
};

const TestComponent: React.FC = () => {
    const context = useContext(RefreshContext);
    if (!context) throw new Error('RefreshContext is undefined');
    return null;
};

describe('RefreshContext', () => {
    it('should provide default undefined value without a provider', () => {
        expect(() => render(<TestComponent />)).toThrow('RefreshContext is undefined');
    });

    it('should provide context values correctly when inside provider', () => {
        let contextValue: RefreshContextType | undefined;
        
        const TestConsumer: React.FC = () => {
            contextValue = useContext(RefreshContext);
            return null;
        };
        
        render(
            <RefreshProvider>
                <TestConsumer />
            </RefreshProvider>
        );
        
        expect(contextValue).toBeDefined();
        expect(contextValue?.refreshing).toBe(false);
    });

    it('should update refreshing state when startRefresh and stopRefresh are called', () => {
        let contextValue: RefreshContextType | undefined;
        
        const TestConsumer: React.FC = () => {
            contextValue = useContext(RefreshContext);
            return null;
        };
        
        render(
            <RefreshProvider>
                <TestConsumer />
            </RefreshProvider>
        );

        act(() => {
            contextValue?.startRefresh();
        });
        expect(contextValue?.refreshing).toBe(true);

        act(() => {
            contextValue?.stopRefresh();
        });
        expect(contextValue?.refreshing).toBe(false);
    });
});
