import React from "react";
import { Button } from "react-native-paper";
import styles from "./OfferTypeButtonStyle";
import { colors } from "../../common-style/Palette";
import { useTranslation } from "react-i18next";

export default function OfferTypeButton({ type, selected, onPressHandler }: any) {
	const { t } = useTranslation('common');

	const mode = selected ? 'contained' : 'outlined'

	return (
		<Button
			mode={mode}
			buttonColor={colors.THEME_500}
			style={[styles.generalButton, styles[`${mode}Button`]]}
			contentStyle={[styles.generalButtonContent, styles[`${mode}ButtonContent`]]}
			labelStyle={[styles.generalButtonLabel, styles[`${mode}ButtonLabel`]]}
			icon={() => {
				if (type.icon && selected) {
					return React.cloneElement(type.icon, { fill: colors.GREY_SCALE_O, marginRight: 8, testID: 'icon' });
				}
				return type.icon ? React.cloneElement(type.icon, { marginRight: 8, testID: 'icon' }) : null;
			}}
			onPress={() => onPressHandler(type.typeId)}
			rippleColor={'transparent'}
		>
			{t(type.label)}
		</Button>
	);
}

