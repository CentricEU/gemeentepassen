import { ImageBackground, View } from 'react-native';
import styles from './RegisterStyle';
import RegisterForm from '../../components/register-form/RegisterForm';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Register({ navigation, route }: AuthScreenProps<'Register'>) {
	return (
		<SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
			<ImageBackground
				source={require('../../assets/background-element.png')}
				style={{ flex: 1 }}
				resizeMode="stretch">
				<View style={styles.mainContainer} testID="mainContainer">
					<RegisterForm navigation={navigation} route={route} />
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}
