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

const FooterActions = ({ navigation }: { navigation: any }) => {
	const { t } = useTranslation("common");

	return (
		<View style={style.buttonContainer}>
			<GenericButton
				type={ButtonTypeEnum.primary}
				text={t("generic.buttons.viewDiscounts")}
				onPressHandler={() =>
					navigation.navigate("DiscountsStack")
				}
			/>
			<WalletButton isIosPlatform={Platform.OS === "ios"} />
		</View>
	);
};

export function DiscountCode({
	route,
	navigation,
}: {
	route: { params: { offerId: string } };
	navigation: any;
}) {
	const [discountCode, setDiscountCode] = useState<DiscountCodeDto | null>(
		null
	);

	const getDiscountCode = async () => {
		try {
			const discountCode = await DiscountCodeService.getDiscountCode(
				route.params.offerId
			);
			setDiscountCode(discountCode);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getDiscountCode();
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
			<FooterActions navigation={navigation} />
		</>
	);
}
