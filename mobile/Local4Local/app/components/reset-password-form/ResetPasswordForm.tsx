import { Keyboard, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { colors } from '../../common-style/Palette';
import GenericButton from '../generic-button/GenericButton';
import React, { memo, useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import UserService from '../../services/UserService';
import { ButtonTypeEnum } from '../../utils/enums/buttonTypeEnum';
import { AuthFormControlsEnum } from '../../utils/enums/authFormControlsEnum';
import CustomToaster from '../error-toaster/CustomToaster';
import { useTranslation } from 'react-i18next';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import { ToasterTypeEnum } from '../../utils/enums/toasterTypeEnum';
import AuthHeader from '../auth-header/AuthHeader';
import { confirmPasswordMatchRule, customPasswordPatternRule } from '../../utils/form/formRules';
import { ResetPasswordDto } from '../../utils/models/ResetPasswordDto';
import { AuthScreenProps } from '../../utils/types/AuthScreenProps';
import styles from './ResetPasswordFormStyle';
import GenericDialog from '../generic-dialog/GenericDialog';
import { NavigationEnum } from '../../utils/enums/navigationEnum';

export type ResetPasswordFormData = {
    password: string;
    confirmPassword: string;
};

const errorMessages: { [key: string]: string } = {
    '40006': 'generic.errors.notFound',
    '40015': 'changePassword.sameAsOldPassword',
    '40014': 'changePassword.tokenExpiredError'
};

function ResetPasswordForm({ navigation, route }: AuthScreenProps<'ResetPassword'>) {
    const { t } = useTranslation('common');
    const { authState, setAuthState } = useContext(AuthenticationContext);
    const { token } = route.params;
    const [requestError, setRequestError] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const { control, trigger, formState: { errors }, watch } = useForm<ResetPasswordFormData>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { password: '', confirmPassword: '' }
    });

    useEffect(() => {
        const validateToken = async () => {
            try {
                await UserService.validateResetPasswordToken(token);
            } catch (error: any) {
                handleErrorType(error);
            }
        };

        validateToken();
    }, [token, t]);

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

    const handleCloseError = () => setRequestError('');

    const handleErrorType = (errorCode: number) => {
        setShowSuccessDialog(false);
        setRequestError(t(errorMessages[errorCode] || 'generic.errors.requestError'));
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

    const handleSendPress = async () => {
        if (!isPasswordInvalid) return;

        try {
            const resetPasswordDto = new ResetPasswordDto(watch('password'), token);
            await UserService.resetPassword(resetPasswordDto);
            setShowSuccessDialog(true);
            setRequestError('');
        } catch (error: any) {
            handleErrorType(error);
        }
    };

    const passwordStep = () => (
        <View style={styles.formContainer}>
            {passwordFormEntries.map((item, index) => (
                <View key={item.name + index}>
                    <Controller
                        control={control}
                        rules={{
                            maxLength: 256,
                            required: { value: true, message: t('generic.errors.requiredField') },
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
                                    mode="outlined"
                                    label={item.label}
                                    placeholder={item.placeholder}
                                    style={{ backgroundColor: colors.SURFACE_50 }}
                                    value={value}
                                    activeOutlineColor={colors.THEME_500}
                                    onChangeText={onChange}
                                    secureTextEntry={true}
                                    error={!!errors[item.name as keyof ResetPasswordFormData]}
                                />
                                <HelperText type="error" visible={!!errors[item.name as keyof ResetPasswordFormData]}>
                                    {errors[item.name as keyof ResetPasswordFormData]?.message}
                                </HelperText>
                            </>
                        )}
                        name={item.name as keyof ResetPasswordFormData}
                    />
                </View>
            ))}
        </View>
    );

    const navigateToLogin = () => () => {
        setShowSuccessDialog(false);
        navigation.navigate(NavigationEnum.login, { errorCode: "" });
    }

    const genericDialog = () => {
        return (
            <GenericDialog
                visible={showSuccessDialog}
                description={<Text>{t('changePassword.dialog.description')}</Text>}
                buttonText={t('changePassword.dialog.buttonText')}
                onMainButtonPress={navigateToLogin()}
                title={t('changePassword.dialog.title')}
                dialogTitle={t('changePassword.dialog.dialogTitle')}
                shouldDisplayTimer={false}
            />
        );
    };

    const renderForm = () => (
        <ScrollView>
            <AuthHeader
                title={t('changePassword.title')}
            />

            <View style={{ marginTop: 0 }}>
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

                {passwordStep()}
            </View>

            <View style={styles.buttonsContainer}>
                <GenericButton
                    type={ButtonTypeEnum.primary}
                    text="generic.buttons.confirm"
                    onPressHandler={handleSendPress}
                    disabled={isPasswordInvalid()}
                />
            </View>
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

export default memo(ResetPasswordForm);
