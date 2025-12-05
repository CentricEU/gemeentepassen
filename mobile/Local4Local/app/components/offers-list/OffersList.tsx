import { FlatList, RefreshControl, Text, View } from "react-native";
import OfferCard from "../offer-card/OfferCard";
import styles from "./OffersListStyle";
import { Button, Divider } from "react-native-paper";
import OfferTypeSelector from "../offer-type-selector/OfferTypeSelector";
import common from "../../common-style/CommonStyle";
import { useCallback, useState } from "react";
import offerChipsData from "../../utils/constants/offerChipsData";
import { useTranslation } from "react-i18next";
import { OfferMobileListDto } from "../../utils/types/offerMobileListDto";
import OfferService from "../../services/OfferService";
import { useFocusEffect } from "@react-navigation/native";
import { useRefresh } from "../../contexts/pull-to-refresh/refresh-provider";

export default function OffersList({
	navigation,
	currentLocation,
	selectedType,
	setSelectedType,
}: any) {
	const { t } = useTranslation("common");
	const { refreshing, startRefresh, stopRefresh } = useRefresh();

	const [currentPage, setCurrentPage] = useState(0);
	const [data, setData] = useState<OfferMobileListDto[]>([]);
	const [loadingOffers, setLoadingOffers] = useState(false);

	const getOffers = async (page: number) => {
		setLoadingOffers(true);
		try {
			const offers: OfferMobileListDto[] = await OfferService.getOffers(
				page,
				currentLocation.latitude,
				currentLocation.longitude
			);
			if (!offers.length) {
				return;
			}

			setData((prevData) =>
				page === 0 ? offers : [...prevData, ...offers]
			);
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingOffers(false);
			stopRefresh();
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (currentPage === 0) {
				getOffers(currentPage);
			}
		}, [currentPage, currentLocation])
	);

	const handleRefresh = () => {
		startRefresh();
		setCurrentPage(0);
		setData([]);
		getOffers(currentPage);
	};

	const handleLoadMore = () => {
		if (!loadingOffers && data.length > 0) {
			setCurrentPage((prevPage) => prevPage + 1);
			getOffers(currentPage + 1);
		}
	};

	const offersListHeader = () => {
		return (
			<View testID="offers-list">
				<View style={styles.offerTypesHeader}>
					<Text style={styles.offersListTitle}>
						{t("offersPage.offerTypes")} (
						{offerChipsData.length - 1})
					</Text>
					<Button
						labelStyle={[
							common.clearDefaults,
							styles.offersListLabel,
						]}
					>
						{t("offersPage.seeAll")}
					</Button>
				</View>
				<OfferTypeSelector
					selectedType={selectedType}
					setSelectedType={setSelectedType}
				/>
				<Divider style={common.divider} />
				<Text
					style={[
						styles.offersListTitle,
						{ marginHorizontal: 16, marginBottom: 8 },
					]}
				>
					{t("offersPage.title")}
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.offersListContainer}>
			<FlatList
				data={data}
				renderItem={({ item }) => (
					<OfferCard
						offer={item}
						customStyle={styles.offersListCard}
						navigation={navigation}
					/>
				)}
				ListHeaderComponent={offersListHeader()}
				style={styles.offersList}
				contentContainerStyle={styles.offersListContent}
				onEndReachedThreshold={0.3}
				onEndReached={handleLoadMore}
				keyExtractor={(item, index) => index.toString()}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
					/>
				}
				testID={"offers-flat-list"}
			/>
		</View>
	);
}
