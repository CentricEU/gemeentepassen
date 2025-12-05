import { View } from "react-native";
import { IconButton, Searchbar } from "react-native-paper";
import SearchRegularIcon from "../../assets/icons/search_r.svg";
import FilterBoldIcon from "../../assets/icons/filter_b.svg";
import styles from "./SearchBarStyle";
import { colors } from "../../common-style/Palette";
import { useTranslation } from "react-i18next";

export default function SearchBar({
	value,
	changeTextHandler,
	placeholder,
	hideFilterButton
}: any) {
	const { t } = useTranslation("common");

	return (
		<View style={styles.searchBarContainer}>
			<Searchbar
				testID="mock-search-bar"
				placeholder={t(placeholder)}
				value={value}
				onChangeText={changeTextHandler}
				style={styles.searchBar}
				right={() => null}
				icon={() => (
					<SearchRegularIcon
						width={24}
						height={24}
						fill={colors.GREY_SCALE}
					/>
				)}
				selectionColor={colors.THEME_500}
				placeholderTextColor={colors.GREY_SCALE}
				inputStyle={styles.searchBarInput}
			/>
			{!hideFilterButton && (
				<IconButton
					icon={() => (
						<FilterBoldIcon
							width={24}
							height={24}
							fill={colors.THEME_500}
						/>
					)}
					mode={"outlined"}
					style={styles.filterButton}
				/>
			)}
		</View>
	);
}
