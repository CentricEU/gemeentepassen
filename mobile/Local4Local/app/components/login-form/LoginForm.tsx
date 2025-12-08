import { Keyboard, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { colors } from '../../common-style/Palette';
import GenericButton from '../generic-button/GenericButton';
import React, { memo, useContext, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import AuthHeader from '../auth-header/AuthHeader';
import { Controller, useForm } from 'react-hook-form';
import styles from './LoginFormStyle';
import UserService from '../../services/UserService';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { AuthFormControlsEnum } from '../../utils/enums/authFormControlsEnum';
import { NavigationEnum } from '../../utils/enums/navigationEnum';
import CustomToaster from '../error-toaster/CustomToaster';
import { CitizenLoginDto } from '../../utils/models/CitizenLoginDto';
import type { LoginFormData } from '../../utils/types/loginFormdata';
import { storeToken } from '../../utils/auth/jwtSecurity';
import { useTranslation } from 'react-i18next';
import { StatusCode } from '../../utils/enums/statusCode.enum';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import GoogleRecaptcha, {
	GoogleRecaptchaActionName,
	GoogleRecaptchaRefAttributes
} from 'react-native-google-recaptcha';
import { RouteProp } from '@react-navigation/native';
import { authorize } from 'react-native-app-auth';
import { getSignicatConfig } from '../../config/signicat-config';
import i18n from '../../../i18n';

type LoginFormProps = {
	navigation: StackNavigationProp<RootStackParamList>;
	route: RouteProp<RootStackParamList, 'Login'>;
};

const errorMessages: { [key: string]: string } = {
	'40025': 'loginPage.accountNotConfirmed',
	'40004': 'loginPage.wrongCredentials',
	'40006': 'generic.errors.notFound',
	'40009': 'loginPage.captchaError',
	'40043': 'loginPage.digiError',
	'40044': 'loginPage.bsnError',
	'40045': 'loginPage.digiDRequestError',
	'40046': 'loginPage.accountDeactivated'
};

function LoginForm({ navigation }: LoginFormProps) {
	const { t } = useTranslation('common');
	const recaptchaRef = React.useRef<GoogleRecaptchaRefAttributes>(null);
	const { authState, setAuthState } = useContext(AuthenticationContext);

	const [captchaToken, setCaptchaToken] = useState('');
	const [requestError, setRequestError] = useState('');
	const [isUserBlocked, setIsUserBlocked] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			email: '',
			password: ''
		}
	});

	const generalFormEntries = [
		{
			name: AuthFormControlsEnum.email,
			label: t('registerPage.registerForm.email'),
			placeholder: t('registerPage.registerForm.emailPlaceholder')
		},
		{
			name: AuthFormControlsEnum.password,
			label: t('registerPage.registerForm.password'),
			placeholder: t('registerPage.registerForm.passwordPlaceholder')
		}
	];

	const handleSend = () => recaptchaRef.current?.open();
	const onVerify = (token: string) => setCaptchaToken(token);
	const handleCloseError = () => setRequestError('');

	const handleErrorType = async (errorCode: number) => {
		if (errorCode === StatusCode.CaptchaError || (errorCode === StatusCode.InvalidCredentials && isUserBlocked)) {
			setIsUserBlocked(true);
			handleSend();
		}

		setCaptchaToken('');
		setRequestError(t(errorMessages[errorCode] || 'generic.errors.requestError'));
	};

	const normalizeLang = (lang: string): string => {
		const map: Record<string, string> = {
			en: 'en-US',
			nl: 'nl-NL'
		};
		return map[lang] || 'nl-NL';
	};

	const handleDigiDLogin = async () => {
		try {
			const rawLanguage = i18n.language;
			const selectedLanguage = normalizeLang(rawLanguage);

			const signicatConfig = getSignicatConfig(selectedLanguage);

			const authResult = await authorize(signicatConfig);
			const { accessTokenStore, refreshToken } = await UserService.loginWithSignicat(
				authResult.idToken,
				authResult.accessToken
			);
			await onLoginSuccess(accessTokenStore, refreshToken || null);
		} catch (error: any) {
			handleErrorType(error);
		}
	};

	const onSubmit = (data: any) => {
		if (isPasswordInvalid()) {
			return;
		}

		handleLogin(new CitizenLoginDto(data.email, data.password, 'ROLE_CITIZEN', captchaToken, true));
	};

	const handleLogin = async (data: CitizenLoginDto) => {
		try {
			const { accessToken, refreshToken } = await UserService.login(data);
			await onLoginSuccess(accessToken, refreshToken || null);
		} catch (error: any) {
			handleErrorType(error);
		}
	};

	const onLoginSuccess = async (accessToken: string, refreshToken: string | null) => {
		await storeToken(accessToken, true);

		if (refreshToken) {
			await storeToken(refreshToken, false);
		}

		const newState = { accessToken, refreshToken, authenticated: true, accountDeleted: false, error: null };
		setAuthState(newState);

		handleCloseError();
		setIsUserBlocked(false);
	};

	const isPasswordInvalid = () => {
		return isEmptyPasswordFields() || hasErrorOnPasswordFields();
	};

	const isEmptyPasswordFields = (): boolean => {
		return !watch(AuthFormControlsEnum.password);
	};

	const hasErrorOnPasswordFields = () => {
		return !!errors.password;
	};

	const isGeneralFormInvalid = () => {
		return isEmptyOnGeneralFields() || hasErrorOnGeneralFields();
	};

	const isEmptyOnGeneralFields = () => {
		return !watch(AuthFormControlsEnum.email) || !watch(AuthFormControlsEnum.password);
	};

	const hasErrorOnGeneralFields = (): boolean => {
		return !!errors.email || !!errors.password;
	};

	const resetAuthState = () => {
		setAuthState({ ...authState, error: null });
	};

	const generalStep = () => {
		return (
			<ScrollView key={'general-form'} contentContainerStyle={{ flexGrow: 1 }}>
				<AuthHeader title={t('loginPage.title')} key={'account'} description={t('generic.welcome')} />
				{(requestError || authState.error) && (
					<CustomToaster
						message={requestError || (authState.error ? t(authState.error) : '') || ''}
						onClose={() => {
							handleCloseError();
							resetAuthState();
						}}
						toasterType={ToasterTypeEnum.ERROR}
					/>
				)}
				{generalFormEntries.map((item, index) => (
					<View key={item.name + index}>
						<Controller
							key={item.name}
							control={control}
							rules={{
								maxLength: 256,
								required: {
									value: true,
									message: t('generic.errors.requiredField')
								},
								validate: (value) => value.trim().length > 0 || t('generic.errors.requiredField'),
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<>
									<TextInput
										testID={item.placeholder}
										onBlur={onBlur}
										mode={'outlined'}
										label={item.label}
										style={{ backgroundColor: colors.SURFACE_50 }}
										placeholder={item.placeholder}
										value={value}
										activeOutlineColor={colors.THEME_500}
										onChangeText={onChange}
										secureTextEntry={item.name === AuthFormControlsEnum.password}
										error={!!errors[item.name as keyof LoginFormData]}
									/>

									<HelperText type="error" visible={!!errors[item.name as keyof LoginFormData]}>
										{errors[item.name as keyof LoginFormData]?.message}
									</HelperText>
								</>
							)}
							name={item.name as keyof LoginFormData}
						/>
						<GoogleRecaptcha
							siteKey="6Ld-jb4pAAAAAI34pOa8uqqGX407eykhcPLDTdO7"
							ref={recaptchaRef}
							baseUrl="https://citizen.testing.gemeentepassen.eu"
							onVerify={onVerify}
							action={GoogleRecaptchaActionName.LOGIN}
						/>
					</View>
				))}

				<View style={styles.forgotPasswordContainer}>
					<Text
						variant="bodyLarge"
						style={styles.hyperlinkAccent}
						onPress={() => navigation.navigate(NavigationEnum.forgotPassword)}
					>
						{t('forgotPassword.hyperlink')}
					</Text>
				</View>

				<View style={styles.buttonsContainer}>
					<GenericButton
						type={ButtonTypeEnum.primary}
						text="generic.buttons.logIn"
						onPressHandler={handleSubmit(onSubmit)}
						disabled={isGeneralFormInvalid()}
					/>

					{/* <Text
                        variant="bodyLarge"
                        style={styles.bottomText}
                    >
                        or
                    </Text>

                    <GenericButton
                        type={ButtonTypeEnum.secondary}
                        text="generic.buttons.continueDigiD"
                        onPressHandler={handleDigiDLogin}
                    /> */}
				</View>

				<View style={styles.bottomContainer}>
					<Text style={styles.linkTextBottom}>
						<Text variant="bodyLarge">{t('loginPage.account')} </Text>
						<Text
							variant="bodyLarge"
							style={styles.hyperlinkAccent}
							onPress={() => navigation.navigate(NavigationEnum.register)}>
							{t('registerPage.register')}
						</Text>
					</Text>
				</View>
			</ScrollView>
		);
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			{generalStep()}
		</TouchableWithoutFeedback>
	);
}

export default memo(LoginForm);
