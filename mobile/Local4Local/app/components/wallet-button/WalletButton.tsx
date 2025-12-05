import React from "react";
import { Button, Text } from "react-native-paper";
import style from "./WalletButtonStyle";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import AndroidWalletIcon from "../../assets/icons/android-wallet.svg";
import AppleWalletIcon from "../../assets/icons/apple-wallet.svg";

interface WalletButtonProps {
	isIosPlatform: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ isIosPlatform }) => {
	const { t } = useTranslation("common");

	const renderIcon = () =>
		isIosPlatform ? (
			<AppleWalletIcon style={style.icon} />
		) : (
			<AndroidWalletIcon style={style.icon} />
		);

	const buttonText = isIosPlatform
		? t("generic.buttons.addApple")
		: t("generic.buttons.addAndroid");

	return (
		<Button
			style={style.button}
			icon={() => renderIcon()}
		>
			<Text style={style.buttonText}>{buttonText}</Text>
		</Button>
	);
};

export default WalletButton;
