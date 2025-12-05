import React, { useState, useEffect } from 'react';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { useTranslation } from 'react-i18next';
import GenericButton from '../generic-button/GenericButton';

const TimerButton = ({ buttonText, onButtonPress }: any) => {
    const { t } = useTranslation('common');
    const [remainingTime, setRemainingTime] = useState(60);
    const initialTime = 60;
    const intervalDuration = 1000;

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const initializeTimer = () => {
            intervalId = setInterval(() => {
                setRemainingTime(prevTime => prevTime - 1);
            }, intervalDuration);
        };

        if (remainingTime > 0) {
            initializeTimer();
        }

        return () => clearInterval(intervalId);
    }, [remainingTime]);

    const shouldDisableButton = () => remainingTime > 0;

    const buttonClick = () => {
        if (shouldDisableButton()) {
            return;
        }

        onButtonPress();
        setRemainingTime(initialTime);
    };

    const combinedButtonText = `${t(buttonText)} ${shouldDisableButton() ? `(${remainingTime}s)` : ''
        }`;

    return (
        <GenericButton
            type={ButtonTypeEnum.primary}
            text={combinedButtonText}
            onPressHandler={buttonClick}
            disabled={shouldDisableButton()}
        />
    );
};

export default TimerButton;
