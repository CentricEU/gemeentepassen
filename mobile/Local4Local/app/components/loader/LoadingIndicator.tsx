import { View, ActivityIndicator } from "react-native";
import { usePromiseTracker } from "react-promise-tracker";
import { colors } from "../../common-style/Palette";
import styles from "./LoadingIndicatorStyle";
import { useRefresh } from "../../contexts/pull-to-refresh/refresh-provider";

const LoadingIndicator: React.FC = () => {
	const { promiseInProgress } = usePromiseTracker();
	const { refreshing } = useRefresh();

	if (!promiseInProgress || refreshing) {
		return null;
	}

	return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator
				testID="loading-indicator"
				size="large"
				color={colors.THEME_500}
			/>
		</View>
	);
};

export default LoadingIndicator;
