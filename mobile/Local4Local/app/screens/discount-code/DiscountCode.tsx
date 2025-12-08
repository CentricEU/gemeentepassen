import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, View } from "react-native";
import style from "./DiscountCodeStyle";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import GenericButton from "../../components/generic-button/GenericButton";
import { DiscountCodeDto } from "../../utils/types/discountCode";
import DiscountCodeService from "../../services/DiscountCodeService";
import WalletButton from "../../components/wallet-button/WalletButton";
import DiscountCodeCard from "../../components/discount-code-card/DiscountCodeCard";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type DiscountsStackParamList = {
	Discounts: undefined;
	DiscountCode: { offerId?: string; discountCode?: DiscountCodeDto };
	Home: undefined;
};

type DiscountCodeScreenNavigationProp = StackNavigationProp<
	DiscountsStackParamList,
	'DiscountCode'
>;

type DiscountCodeScreenRouteProp = RouteProp<DiscountsStackParamList, 'DiscountCode'>;

type DiscountCodeProps = {
	route: DiscountCodeScreenRouteProp;
	navigation: DiscountCodeScreenNavigationProp;
};


const FooterActions = ({ navigation, offerId }: { navigation: any; offerId: string | undefined }) => {
	const { t } = useTranslation("common");

	return (
		<View style={style.buttonContainer}>
			{offerId && (
				<GenericButton
					type={ButtonTypeEnum.primary}
					text={t("generic.buttons.viewDiscounts")}
					onPressHandler={() => navigation.navigate("DiscountsStack")}
				/>
			)}
			<WalletButton isIosPlatform={Platform.OS === "ios"} />
		</View>
	);
};


export function DiscountCode({
	route,
	navigation,
}: DiscountCodeProps) {
	const [discountCode, setDiscountCode] = useState<DiscountCodeDto | null>(
		route.params.discountCode || null
	);

	const getDiscountCode = async () => {
		if (!route.params.offerId) return;

		try {
			const fetchedDiscountCode = await DiscountCodeService.getDiscountCode(
				route.params.offerId
			);
			setDiscountCode(fetchedDiscountCode);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (!discountCode) {
			getDiscountCode();
		}
	}, []);

	if (!discountCode) return null;

	return (
		<>
			{discountCode && (
				<ScrollView
					style={style.discountCodePage}
					contentContainerStyle={style.container}
				>
					<DiscountCodeCard
						discountCode={discountCode}
						isDiscountsListView={false}
					/>
				</ScrollView>
			)}
			<FooterActions navigation={navigation} offerId={route.params.offerId} />
		</>
	);
}