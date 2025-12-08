import { ImageBackground, View } from 'react-native';
import styles from './LoginStyle';
import LoginForm from '../../components/login-form/LoginForm';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomToaster from '../../components/error-toaster/CustomToaster';
import { Portal } from 'react-native-paper';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Login({ navigation, route }: AuthScreenProps<'Login'>) {
	const { t } = useTranslation('common');

	const [requestError, setRequestError] = useState('');

	useEffect(() => {
		if (route.params?.errorCode === '40027') {
			setRequestError(t('registerPage.resendEmailError'));
		}
	}, [route.params?.errorCode]);

	const handleCloseError = () => setRequestError('');

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
			<ImageBackground
				source={require('../../assets/background-element.png')}
				style={{ flex: 1 }}
				resizeMode="stretch">
				<View style={styles.mainContainer} testID="mainContainer">
					<LoginForm navigation={navigation} route={route} />
					{requestError && (
						<Portal>
							<View style={styles.bottomToaster}>
								<CustomToaster
									message={requestError}
									onClose={() => handleCloseError()}
									toasterType={ToasterTypeEnum.INFO}
								/>
							</View>
						</Portal>
					)}
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}
