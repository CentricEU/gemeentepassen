import { ImageBackground, View } from 'react-native';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import styles from './ResetPasswordStyle';
import ResetPasswordForm from '../../components/reset-password-form/ResetPasswordForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ResetPassword({ navigation, route }: AuthScreenProps<'ResetPassword'>) {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
			<ImageBackground
				source={require('../../assets/background-element.png')}
				style={{ flex: 1 }}
				resizeMode="stretch">
				<View style={styles.mainContainer} testID="mainContainer">
					<ResetPasswordForm navigation={navigation} route={route} />
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}
