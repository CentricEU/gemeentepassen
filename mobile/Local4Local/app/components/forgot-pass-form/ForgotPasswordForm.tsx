import { Keyboard, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { colors } from '../../common-style/Palette';
import GenericButton from '../generic-button/GenericButton';
import React, { memo, useContext, useState, useRef, useCallback } from 'react';
import { Controller, set, useForm } from 'react-hook-form';
import UserService from '../../services/UserService';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { AuthFormControlsEnum } from '../../utils/enums/authFormControlsEnum';
import CustomToaster from '../error-toaster/CustomToaster';
import { useTranslation } from 'react-i18next';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import GoogleRecaptcha, { GoogleRecaptchaActionName, GoogleRecaptchaRefAttributes } from 'react-native-google-recaptcha';
import styles from './ForgotPasswordFormStyle';
import AuthHeader from '../auth-header/AuthHeader';
import { customEmailPatternRule } from '../../utils/form/formRules';
import { ForgotPasswordDto } from '../../utils/models/ForgotPasswordDto';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import GenericDialog from '../generic-dialog/GenericDialog';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationEnum } from '../../utils/enums/navigationEnum';

export type ForgotPasswordFormData = {
    email: string;
    recaptcha: string;
};

const errorMessages: { [key: string]: string } = {
    '40025': 'loginPage.accountNotConfirmed',
    '40006': 'generic.errors.notFound',
    '40009': 'loginPage.captchaError',
    '40046': 'loginPage.accountDeactivated',
    '40038': 'generic.errors.roleNotAllowed',
    '40013': 'forgotPassword.recoveryExceedLimit',
    "40003": 'generic.errors.mailRequirementsNotMet'
};

function ForgotPasswordForm({ navigation}: AuthScreenProps<'ForgotPassword'>) {
    const { t, i18n } = useTranslation('common');
    const { authState, setAuthState } = useContext(AuthenticationContext);
    const recaptchaRef = useRef<GoogleRecaptchaRefAttributes>(null);

    const [requestError, setRequestError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);


    const { control, setValue, trigger, formState: { errors }, watch } = useForm<ForgotPasswordFormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { email: '', recaptcha: '' }
    });

    const handleCloseError = () => setRequestError('');

    useFocusEffect(
        useCallback(() => {
            return () => {
                setShowSuccessDialog(false);
            };
        }, [])
    );

    const handleErrorType = (errorCode: number) => {
        setShowSuccessDialog(false);
        setCaptchaToken('');
        setValue('recaptcha', '');
        setRequestError(t(errorMessages[errorCode] || 'generic.errors.requestError'));
    };

    const isSendEnabled = () => {
        return !!watch('email') && !errors.email;
    };

    const handleSendPress = async () => {
        const isValid = await trigger('email');
        if (!isValid) return;

        recaptchaRef.current?.open();
    };

    const onVerifyCaptcha = async (token?: string) => {
        if (!token) return;

        setCaptchaToken(token);
        setValue('recaptcha', token, { shouldValidate: true });

        try {
            const forgotPasswordDto = new ForgotPasswordDto(watch('email'), token, 'ROLE_CITIZEN');
            await UserService.forgotPassword(forgotPasswordDto, i18n.language);
            setShowSuccessDialog(true);
            setRequestError('');
        } catch (error: any) {
            handleErrorType(error);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate(NavigationEnum.login, {});
    }

    const genericDialog = () => {
        return (
            <GenericDialog
                visible={showSuccessDialog}
                description={<Text>{t('forgotPassword.dialog.description')}</Text>}
                title={t('forgotPassword.dialog.title')}
                dialogTitle={t('forgotPassword.dialog.dialogTitle')}
                shouldDisplayTimer={false}
            />
        );
    };

    const renderForm = () => (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <AuthHeader
                title={t('forgotPassword.title')}
                description={t('forgotPassword.description')}
            />

            {(requestError || authState.error) && (
                <CustomToaster
                    message={requestError || (authState.error ? t(authState.error) : '') || ''}
                    onClose={() => {
                        handleCloseError();
                        setAuthState({ ...authState, error: null });
                    }}
                    toasterType={ToasterTypeEnum.ERROR}
                />
            )}

            {/* EMAIL FIELD */}
            <View key={AuthFormControlsEnum.email}>
                <Controller<ForgotPasswordFormData>
                    name="email"
                    control={control}
                    rules={{
                        maxLength: 256,
                        required: { value: true, message: t('generic.errors.requiredField') },
                        validate: (value) => value.trim().length > 0 || t('generic.errors.requiredField'),
                        ...customEmailPatternRule(
                            true,
                            t('generic.errors.invalidEmail')
                        )
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <>
                            <TextInput
                                onBlur={onBlur}
                                mode="outlined"
                                label={t('registerPage.registerForm.email')}
                                placeholder={t('forgotPassword.emailPlaceholder')}
                                style={{ backgroundColor: colors.SURFACE_50 }}
                                value={value}
                                activeOutlineColor={colors.THEME_500}
                                onChangeText={onChange}
                                error={!!errors.email}
                            />
                            <HelperText type="error" visible={!!errors[AuthFormControlsEnum.email]}>
                                {errors[AuthFormControlsEnum.email]?.message}
                            </HelperText>
                        </>
                    )}
                />
            </View>
            {/* SEND BUTTON: opens captcha */}
            <View style={styles.buttonsContainer}>
                <GenericButton
                    type={ButtonTypeEnum.primary}
                    text="forgotPassword.send"
                    onPressHandler={handleSendPress}
                    disabled={!isSendEnabled()}
                />
                 <GenericButton
                    type={ButtonTypeEnum.secondary}
                    text="generic.buttons.back"
                    onPressHandler={navigateToLogin}
                />
            </View>

            {/* Google Recaptcha */}
            <GoogleRecaptcha
                siteKey="6Ld-jb4pAAAAAI34pOa8uqqGX407eykhcPLDTdO7"
                ref={recaptchaRef}
                baseUrl="https://citizen.testing.gemeentepassen.eu"
                onVerify={onVerifyCaptcha}
                action={GoogleRecaptchaActionName.PASSWORD_RESET}
            />
        </ScrollView>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <>
                {renderForm()}
                {showSuccessDialog && genericDialog()}
            </>
        </TouchableWithoutFeedback>
    );

}

export default memo(ForgotPasswordForm);
