import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import styles from './SearchDropdownStyle';
import { useTranslation } from 'react-i18next';
import CustomToaster from '../error-toaster/CustomToaster';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import { useKeyboard } from '../../utils/HelperUtils';

export default function SearchDropdown({
	results,
	history,
	onSelectResult,
	isSearching,
	showMinLengthWarning,
	onCloseWarning
}: {
	results: string[];
	history: string[];
	onSelectResult: (selectedText: string) => void;
	isSearching: boolean;
	showMinLengthWarning?: boolean;
	onCloseWarning?: () => void;
}) {
	const { t } = useTranslation('common');
	const noResults = results.length === 0;
	const noHistory = history.length === 0;
	const keyboardHeight = Platform.OS === 'android' ? 60 : useKeyboard() - 20;

	return (
		<View style={styles.searchResultsContainer}>
			{isSearching ? (
				noResults ? (
					// Show empty space if no suggestions
					<></>
				) : (
					// Show titles suggestions
					results.map((offer, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => onSelectResult(offer)}
							style={styles.resultItemContainer}>
							<Text style={styles.searchResultItem}>{offer}</Text>
						</TouchableOpacity>
					))
				)
			) : noHistory ? (
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					style={styles.keyboardAvoider}
					keyboardVerticalOffset={100}>
					<View style={styles.gettingStarted}>
						<Text style={styles.getStartedText}>{t('search.gettingStarted')}</Text>
						<Text style={styles.searchHistoryText}>{t('search.searchHistory')}</Text>
					</View>
				</KeyboardAvoidingView>
			) : (
				// Show recent search history
				<>
					<Text style={styles.historyTitle}>{t('search.recent')}</Text>
					{history.map((item, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => onSelectResult(item)}
							style={styles.resultItemContainer}>
							<Text style={styles.searchHistoryItem}>{item}</Text>
						</TouchableOpacity>
					))}
				</>
			)}
			{showMinLengthWarning && (
				<View style={{ position: 'absolute', bottom: keyboardHeight }}>
					<CustomToaster
						message={t('search.minimumCharactersWarning')}
						toasterType={ToasterTypeEnum.WARNING}
						onClose={onCloseWarning || (() => {})}
					/>
				</View>
			)}
		</View>
	);
}
