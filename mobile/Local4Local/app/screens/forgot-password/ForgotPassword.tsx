import { ImageBackground, View } from 'react-native';
import styles from './ForgotPasswordStyle';
import ForgotPasswordForm from '../../components/forgot-pass-form/ForgotPasswordForm';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ForgotPassword({ navigation, route }: AuthScreenProps<'ForgotPassword'>) {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
			<ImageBackground
				source={require('../../assets/background-element.png')}
				style={{ flex: 1 }}
				resizeMode="stretch">
				<View style={styles.mainContainer} testID="mainContainer">
					<ForgotPasswordForm navigation={navigation} route={route} />
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}
