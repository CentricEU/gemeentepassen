import { View } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import SearchRegularIcon from '../../assets/icons/search_r.svg';
//import FilterBoldIcon from '../../assets/icons/filter_b.svg';
import ClearSearch from '../../assets/icons/clear-input.svg';
import BackArrow from '../../assets/icons/back.svg';
import styles from './SearchBarStyle';
import { colors } from '../../common-style/Palette';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { MINIMUM_SEARCH_KEYWORD_LENGTH } from '../../utils/constants/constants';

export default function SearchBar({
	value,
	changeTextHandler,
	placeholder,
	onSearchPress,
	onFocus,
	onBlur,
	resetSearchBar,
	disableFocus = false,
	setShowMinLengthWarning
}: any) {
	const { t } = useTranslation('common');
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = () => {
		if (disableFocus) return;
		setIsFocused(true);
		if (onFocus) onFocus();
	};

	const handleBlur = () => {
		if (disableFocus) return;
		setIsFocused(false);
		if (onBlur) onBlur();
		setShowMinLengthWarning(false);
		changeTextHandler('');
		resetSearchBar();
	};

	const blurOnSubmit = (): boolean => value.length >= MINIMUM_SEARCH_KEYWORD_LENGTH;

	const renderClearButton = () =>
		value.length > 0 ? (
			<IconButton
				testID="clear-button"
				icon={() => <ClearSearch width={16} height={16} fill={colors.GREY_SCALE} />}
				onPress={() => changeTextHandler('')}
				style={styles.clearButton}
			/>
		) : null;

	return (
		<View style={[styles.searchBarContainer, isFocused && styles.searchBarContainerFocused]}>
			{isFocused && (
				<IconButton
					testID="back-button"
					icon={() => <BackArrow width={24} height={24} fill={colors.GREY_SCALE} />}
					onPress={handleBlur}
				/>
			)}
			<Searchbar
				testID="mock-search-bar"
				placeholder={t(placeholder)}
				value={value}
				onChangeText={changeTextHandler}
				style={styles.searchBar}
				onFocus={handleFocus}
				onBlur={handleBlur}
				inputStyle={styles.searchBarInput}
				right={renderClearButton}
				maxLength={100}
				icon={() => (
					<IconButton
						testID="search-icon-button"
						icon={() => <SearchRegularIcon width={24} height={24} fill={colors.GREY_SCALE} />}
						onPress={onSearchPress}
						style={{ margin: 0, padding: 0 }}
					/>
				)}
				onSubmitEditing={onSearchPress}
				selectionColor={colors.THEME_500}
				placeholderTextColor={colors.GREY_SCALE}
				blurOnSubmit={blurOnSubmit()}
			/>
			{ /*!isFocused && (
				<IconButton
					icon={() => <FilterBoldIcon width={24} height={24} fill={colors.THEME_500} />}
					mode={'outlined'}
					style={styles.filterButton}
				/>
			)
				*/}
		</View>
	);
}
