
import React from 'react';
import { Button } from 'react-native-paper';

const MockViewModeButton = ({ onPressHandler }: { onPressHandler: () => void }) => {
    return (
        <Button
            testID="mock-view-mode-button"
            onPress={onPressHandler}
        >
            View Mode Button

        </Button>

    );
};

export default MockViewModeButton;
