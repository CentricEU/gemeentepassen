import React from "react";
import { colors } from "../../common-style/Palette";
import styles from "./GlobalHeaderStyle";
import ArrowLeftRegularIcon from "../../assets/icons/chevron-large-left_r.svg";
import { StackNavigationOptions } from "@react-navigation/stack";
import { commonShadowStyles } from "../../common-style/CommonShadowStyle";


export const headerOptions: StackNavigationOptions = {
	headerTitleAlign: 'center',
	headerBackTitleVisible: false,
	headerTintColor: colors.GREY_SCALE,
	headerTitleContainerStyle: styles.headerTitleContainer,
	headerTitleStyle: styles.headerTitle,
	headerBackImage: () => (
		<ArrowLeftRegularIcon
			width={24}
			height={24}
			fill={colors.GREY_SCALE}
			style={styles.backButton} />
	),
	headerShadowVisible: true,
	headerStyle: {
		borderBottomWidth: 0,
		shadowColor: colors.WHITE,
		elevation: 5,
		...commonShadowStyles.shadow
	},
}
