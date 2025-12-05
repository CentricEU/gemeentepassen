import React from 'react';
import { Button } from 'react-native-paper';
import { Text } from 'react-native';
import { colors } from '../../common-style/Palette';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { ButtonStyleEnum } from '../../utils/enums/buttonStyleEnum';
import { ButtonStyle } from '../../utils/types/buttonStyle';
import { useTranslation } from 'react-i18next';

import styles from './GenericButtonStyle';

interface Props {
  type: ButtonTypeEnum;
  text: string;
  onPressHandler: () => void;
  disabled?: boolean;
}

const GenericButton: React.FC<Props> = ({ type, text, onPressHandler, disabled = false }) => {
  const { t } = useTranslation('common');

  const getMode = (type: ButtonTypeEnum): ButtonStyle => {
    switch (type) {
      case ButtonTypeEnum.primary:
        return ButtonStyleEnum.contained;
      case ButtonTypeEnum.secondary:
        return ButtonStyleEnum.outlined;
      default:
        return ButtonStyleEnum.contained;
    }
  };

  const getButtonColor = (type: ButtonTypeEnum, disabled: boolean): string => {
    switch (type) {
      case ButtonTypeEnum.danger:
        return disabled ? colors.DISABLED_DANGER : colors.DANGER_400;
      case ButtonTypeEnum.primary:
        return disabled ? colors.DISABLED : colors.THEME_500;
      case ButtonTypeEnum.secondary:
        return colors.GREY_SCALE_O;
      default:
        return '';
    }
  };

  const getTextColor = (type: ButtonTypeEnum) => {
    switch (type) {
      case ButtonTypeEnum.primary:
        return colors.GREY_SCALE_O;
      case ButtonTypeEnum.secondary:
        return colors.THEME_500;
      case ButtonTypeEnum.danger:
        return colors.GREY_SCALE_O;
      default:
        return '';
    }
  };

  return (
    <Button
      mode={getMode(type)}
      disabled={disabled}
      style={[
        styles.genericStyle,
        { backgroundColor: getButtonColor(type, disabled) },
      ]}
      labelStyle={[styles.buttonLabel, { color: getTextColor(type) }]}
      onPress={onPressHandler}
    >
      <Text>{t(text)}</Text>
    </Button>
  );
};

export default GenericButton;
