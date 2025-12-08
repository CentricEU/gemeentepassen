import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { HelperText, Text, TextInput, Checkbox } from 'react-native-paper';
import { colors } from '../../common-style/Palette';
import GenericButton from '../generic-button/GenericButton';
import TermsAndConditions from '../terms-and-conditions/TermsAndConditions';
import React, { memo, useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { RouteProp } from '@react-navigation/native';
import AuthHeader from '../auth-header/AuthHeader';
import { Controller, useForm } from 'react-hook-form';
import { CitizenRegisterDto } from '../../utils/models/CitizenRegisterDto';
import styles from './RegisterFormStyle';
import {
	customEmailPatternRule,
	confirmPasswordMatchRule,
	customPasswordPatternRule
} from '../../utils/form/formRules';
import UserService from '../../services/UserService';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { AuthFormControlsEnum } from '../../utils/enums/authFormControlsEnum';
import { NavigationEnum } from '../../utils/enums/navigationEnum';
import { GeneralFormData } from '../../utils/types/generalFormData';
import { useTranslation } from 'react-i18next';
import CustomToaster from '../error-toaster/CustomToaster';
import GenericDialog from '../generic-dialog/GenericDialog';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import { StatusCode } from '../../utils/enums/statusCode.enum';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type RegisterFormProps = {
	navigation: StackNavigationProp<RootStackParamList, 'Register'>;
	route: RouteProp<RootStackParamList, 'Register'>;
};

function RegisterForm({ navigation, route }: RegisterFormProps) {
	const { t, i18n } = useTranslation('common');

	const handleWillBlur = () => {
		setShowDialog(false);
	};

	useEffect(() => {
		const unsubscribe = navigation.addListener('blur', handleWillBlur);
		return () => {
			unsubscribe();
		};
	}, [navigation]);

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			passID: '',
			password: '',
			confirmPassword: ''
		}
	});

	const descriptionParts = t('registerPage.registrationDialog.description', {
		email: watch('email')
	}).split('**');

	const [hidePass, setHidePass] = useState(true);
	const [hideConfirmPass, setHideConfirmPass] = useState(true);
	const [isGeneralStepCompleted, setIsGeneralStepCompleted] = useState(false);
	const [termsAndConditionView, setTermsAndConditionView] = useState(false);
	const [uniqueEmail, setUniqueEmail] = useState(false);
	const [uniquePassnumber, setUniquePassnumber] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [requestError, setRequestError] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);

	const pressEyePasswordIcon = (hide: boolean, name: string) => {
		if (name === AuthFormControlsEnum.password) {
			setHidePass(hide);
			return;
		}
		setHideConfirmPass(hide);
	};

	const handleCloseError = () => {
		setUniquePassnumber(false);
		setUniqueEmail(false);
	};

	const generalFormSubmit = () => {
		if (isGeneralFormInvalid()) {
			return;
		}

		setIsGeneralStepCompleted(true);
	};

	const isPasswordInvalid = () => {
		return isEmptyPasswordFields() || hasErrorOnPasswordFields();
	};

	const isEmptyPasswordFields = (): boolean => {
		return !watch(AuthFormControlsEnum.password) || !watch(AuthFormControlsEnum.confirmPassword);
	};

	const hasErrorOnPasswordFields = () => {
		return !!errors.password || !!errors.confirmPassword;
	};

	const onSubmit = (data: any) => {
		if (isPasswordInvalid()) {
			return;
		}
		const citizenRegisterDto = new CitizenRegisterDto(
			data.email,
			data.firstName,
			data.lastName,
			data.password,
			data.confirmPassword,
			data.passID
		);
		createAccount(citizenRegisterDto, i18n.language);
	};

	const createAccount = async (data: CitizenRegisterDto, language: string) => {
		try {
			handleCloseError();
			await UserService.registerUser(data, language);
			setShowDialog(true);
		} catch (error: any) {
			if (error == StatusCode.UniqueConstraintViolated) {
				setUniqueEmail(true);
			} else {
				setUniquePassnumber(true);
			}

			setIsGeneralStepCompleted(false);
			setShowDialog(false);
		}
	};

	const resendConfirmationEmail = async () => {
		try {
			await UserService.resendConfirmationToken(watch('email'));
		} catch (error: any) {
			handleErrorType(error.message);
		}
	};

	const navigateToLogin = () => {
		navigation.navigate(NavigationEnum.login, {});
	};

	const isGeneralFormInvalid = () => {
		return isEmptyOnGeneralFields() || hasErrorOnGeneralFields() || !termsAccepted;
	};

	const isEmptyOnGeneralFields = () => {
		return (
			!watch(AuthFormControlsEnum.firstName) ||
			!watch(AuthFormControlsEnum.lastName) ||
			!watch(AuthFormControlsEnum.email) ||
			!watch(AuthFormControlsEnum.passID)
		);
	};

	const hasErrorOnGeneralFields = (): boolean => {
		return !!errors.firstName || !!errors.lastName || !!errors.email || !!errors.passID;
	};

	const generalFormEntries = [
		{
			name: AuthFormControlsEnum.firstName,
			label: t('registerPage.registerForm.firstName'),
			placeholder: t('registerPage.registerForm.firstNamePlaceholder')
		},
		{
			name: AuthFormControlsEnum.lastName,
			label: t('registerPage.registerForm.lastName'),
			placeholder: t('registerPage.registerForm.lastNamePlaceholder')
		},
		{
			name: AuthFormControlsEnum.passID,
			label: t('registerPage.registerForm.passId'),
			placeholder: t('registerPage.registerForm.passIdPlaceholder')
		},
		{
			name: AuthFormControlsEnum.email,
			label: t('registerPage.registerForm.email'),
			placeholder: t('registerPage.registerForm.emailPlaceholder')
		}
	];

	const passwordFormEntries = [
		{
			name: AuthFormControlsEnum.password,
			label: t('registerPage.registerForm.password'),
			placeholder: t('registerPage.registerForm.passwordPlaceholder')
		},
		{
			name: AuthFormControlsEnum.confirmPassword,
			label: t('registerPage.registerForm.retypePassword'),
			placeholder: t('registerPage.registerForm.retypePasswordPlaceholder')
		}
	];

	const errorMessages = [
		{
			uniqueConstraint: uniqueEmail,
			messageKey: 'registerPage.uniqueEmailError'
		},
		{
			uniqueConstraint: uniquePassnumber,
			messageKey: 'registerPage.passnumberAlreadyUsedOrInvalid'
		}
	];

	const generateDescriptionParts = () => {
		return descriptionParts.map((part, index) => {
			return index % 2 === 0 ? (
				<Text key={index}>{part}</Text>
			) : (
				<Text key={index} style={{ fontWeight: 'bold' }}>
					{part}
				</Text>
			);
		});
	};

	const handleErrorType = async (error: string) => {
		if (error === '40027') {
			navigation.navigate(NavigationEnum.login, { errorCode: '40027' });
			setShowDialog(false);
			return;
		}

		setRequestError(t('generic.errors.requestError'));
	};

	const ToastErrorNotifications = () => (
		<>
			{errorMessages.map(
				({ uniqueConstraint, messageKey }, index) =>
					uniqueConstraint && (
						<CustomToaster
							key={index}
							message={t(messageKey)}
							onClose={handleCloseError}
							toasterType={ToasterTypeEnum.ERROR}
						/>
					)
			)}
		</>
	);

	const generalStep = () => {
		return (
			<KeyboardAwareScrollView showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				key={'general-form'}
				contentContainerStyle={{ flexGrow: 1 }}>
				<AuthHeader
					title={'registerPage.createAccount'}
					key={'account'}
					description={'registerPage.createAccountDescription'}
				/>

				<ToastErrorNotifications></ToastErrorNotifications>

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
								...customEmailPatternRule(
									item.name === AuthFormControlsEnum.email,
									t('generic.errors.invalidEmail')
								)
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<>
									<TextInput
										testID={item.placeholder}
										onBlur={onBlur}
										mode={'outlined'}
										label={item.label}
										style={{
											backgroundColor: colors.SURFACE_50
										}}
										placeholder={item.placeholder}
										value={value}
										activeOutlineColor={colors.THEME_500}
										onChangeText={onChange}
										error={!!errors[item.name as keyof GeneralFormData]}
									/>

									<HelperText type="error" visible={!!errors[item.name as keyof GeneralFormData]}>
										{errors[item.name as keyof GeneralFormData]?.message}
									</HelperText>
								</>
							)}
							name={item.name as keyof GeneralFormData}
						/>
					</View>
				))}

				<View style={styles.checkboxRow}>
					<Checkbox.Android
						status={termsAccepted ? 'checked' : 'unchecked'}
						onPress={() => setTermsAccepted(!termsAccepted)}
						uncheckedColor="#000"
						color="#000"
					/>

					<Text style={styles.linkTextContent}>
						{t('termsAndConditions.textDescription1') + ' '}
						<Text style={styles.hyperlinkClassic} onPress={() => setTermsAndConditionView(true)}>
							{t('termsAndConditions.textDescription2')}
						</Text>
					</Text>
				</View>

				<View style={styles.buttonsContainer}>
					<GenericButton
						type={ButtonTypeEnum.primary}
						text="generic.buttons.continue"
						onPressHandler={generalFormSubmit}
						disabled={isGeneralFormInvalid()}
					/>

					{/* <Text variant="bodyLarge" style={{ marginBottom: 12, color: colors.BLACK }}>
						or
					</Text>

					<GenericButton
						type={ButtonTypeEnum.secondary}
						text="generic.buttons.continueDigiD"
						onPressHandler={() => {
							console.log('Navigate to Digi D');
						}}
					/> */}
				</View>

				<View style={styles.bottomContainer}>
					<Text style={styles.linkTextBottom}>
						<Text variant="bodyLarge">{t('termsAndConditions.question')} </Text>
						<Text
							variant="bodyLarge"
							style={styles.hyperlinkAccent}
							onPress={() =>
								navigation.navigate(NavigationEnum.login, {
									errorCode: ''
								})
							}>
							{t('termsAndConditions.logIn')}
						</Text>
					</Text>
				</View>
			</KeyboardAwareScrollView>
		);
	};

	const passwordStep = () => {
		return (
			<View key={'password-form'} style={styles.formContainer}>
				<AuthHeader
					title={'registerPage.createPassword'}
					key={'password'}
					description={'registerPage.createPasswordDescription'}
				/>

				{passwordFormEntries.map((item, index) => (
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
								...customPasswordPatternRule(
									item.name === AuthFormControlsEnum.password,
									t('generic.errors.passwordRule')
								),
								...confirmPasswordMatchRule(
									item.name === AuthFormControlsEnum.confirmPassword,
									AuthFormControlsEnum.password,
									t('generic.errors.passwordMatch')
								)
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<>
									<TextInput
										testID={item.placeholder}
										onBlur={onBlur}
										mode={'outlined'}
										label={item.label}
										style={{
											backgroundColor: colors.SURFACE_50
										}}
										placeholder={item.placeholder}
										value={value}
										activeOutlineColor={colors.THEME_500}
										onChangeText={onChange}
										secureTextEntry={
											item.name === AuthFormControlsEnum.password ? hidePass : hideConfirmPass
										}
										right={
											<TextInput.Icon
												icon="eye"
												onPressIn={() => {
													pressEyePasswordIcon(false, item.name);
												}}
												onPressOut={() => {
													pressEyePasswordIcon(true, item.name);
												}}
											/>
										}
										error={!!errors[item.name as keyof GeneralFormData]}
									/>

									<HelperText type="error" visible={!!errors[item.name as keyof GeneralFormData]}>
										{errors[item.name as keyof GeneralFormData]?.message}
									</HelperText>
								</>
							)}
							name={item.name as keyof GeneralFormData}
						/>
					</View>
				))}

				<View style={styles.buttonsContainer}>
					<GenericButton
						type={ButtonTypeEnum.primary}
						text="generic.buttons.createAccount"
						onPressHandler={handleSubmit(onSubmit)}
						disabled={isPasswordInvalid()}
					/>
				</View>

				<View style={styles.bottomContainer}></View>
			</View>
		);
	};

	const genericDialog = () => {
		return (
			<GenericDialog
				visible={true}
				description={<Text>{generateDescriptionParts()}</Text>}
				buttonText={t('registerPage.registrationDialog.buttonText')}
				secondaryButtonText={t('generic.buttons.backToLogin')}
				title={t('registerPage.registrationDialog.title')}
				dialogTitle={t('registerPage.registrationDialog.title')}
				onMainButtonPress={resendConfirmationEmail}
				onSecondaryButtonPress={navigateToLogin}
				shouldDisplayTimer={true}
			/>
		);
	};

	const termsAndConditionsDialog = () => {
		return (
			<View style={styles.termsAndConditionsLayout}>
				<ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
					<TermsAndConditions setTermsAndConditionView={setTermsAndConditionView} />
				</ScrollView>
			</View>
		);
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<>
				{termsAndConditionView
					? termsAndConditionsDialog()
					: !isGeneralStepCompleted
					? generalStep()
					: !showDialog
					? passwordStep()
					: genericDialog()}
			</>
		</TouchableWithoutFeedback>
	);
}

export default memo(RegisterForm);
