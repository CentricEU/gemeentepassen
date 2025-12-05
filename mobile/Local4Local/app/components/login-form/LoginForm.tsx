import {
    Keyboard,
    ScrollView,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { HelperText, Text, TextInput } from "react-native-paper";
import { colors } from "../../common-style/Palette";
import GenericButton from "../generic-button/GenericButton";
import React, { memo, useContext, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import AuthHeader from "../auth-header/AuthHeader";
import { Controller, useForm } from "react-hook-form";
import styles from "./LoginFormStyle";
import UserService from "../../services/UserService";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import { AuthFormControlsEnum } from "../../utils/enums/authFormControlsEnum";
import { NavigationEnum } from "../../utils/enums/navigationEnum";
import CustomToaster from "../error-toaster/CustomToaster";
import { CitizenLoginDto } from "../../utils/models/CitizenLoginDto";
import type { LoginFormData } from "../../utils/types/loginFormdata";
import { storeToken } from "../../utils/auth/jwtSecurity";
import { useTranslation } from "react-i18next";
import { ErrorCode } from "../../utils/enums/errorType.enum";
import AuthenticationContext from "../../contexts/authentication/authentication-context";
import { ToasterTypeEnum } from "../../utils/enums/toasterTypeEnum";
import GoogleRecaptcha,
{
    GoogleRecaptchaActionName,
    GoogleRecaptchaRefAttributes
} from "react-native-google-recaptcha";


type LoginFormProps = {
    navigation: StackNavigationProp<RootStackParamList>;
};

const errorMessages: { [key: string]: string } = {
    "40025": 'loginPage.accountNotConfirmed',
    "40004": 'loginPage.wrongCredentials',
    "40009": 'loginPage.captchaError'
};

function LoginForm({ navigation }: LoginFormProps) {
    const { t } = useTranslation('common');
    const recaptchaRef = React.useRef<GoogleRecaptchaRefAttributes>(null);
    const { setAuthState } = useContext(AuthenticationContext);

    const [captchaToken, setCaptchaToken] = useState("");
    const [requestError, setRequestError] = useState("");
    const [isUserBlocked, setIsUserBlocked] = useState(false);

    const { control, handleSubmit, formState: { errors }, watch } = useForm({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const generalFormEntries = [
        {
            name: AuthFormControlsEnum.email,
            label: t('registerPage.registerForm.email'),
            placeholder: t('registerPage.registerForm.emailPlaceholder'),
        },
        {
            name: AuthFormControlsEnum.password,
            label: t('registerPage.registerForm.password'),
            placeholder: t('registerPage.registerForm.passwordPlaceholder'),
        },
    ];

    const handleSend = () => recaptchaRef.current?.open();
    const onVerify = (token: string) => setCaptchaToken(token);
    const handleCloseError = () => setRequestError("");

    const handleErrorType = async (errorCode: string) => {
        if (errorCode === ErrorCode.CaptchaError ||
            (errorCode === ErrorCode.WrongCredentials && isUserBlocked)) {
            setIsUserBlocked(true);
            handleSend();
        }

        setCaptchaToken("");
        setRequestError(t(errorMessages[errorCode] || 'loginPage.requestError'));
    };

    const onSubmit = (data: any) => {
        if (isPasswordInvalid()) {
            return;
        }

        handleLogin(new CitizenLoginDto(data.email, data.password, "ROLE_CITIZEN", captchaToken, true));
    };

    const handleLogin = async (data: CitizenLoginDto) => {
        try {
            const { token } = await UserService.login(data);
            await onLoginSuccess(token);
        } catch (error: any) {
            handleErrorType(error.message);
        }
    };

    const onLoginSuccess = async (token: string) => {
        await storeToken(token);

        const newState = { token, authenticated: true, accountDeleted: false };
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
        return (
            !watch(AuthFormControlsEnum.email) ||
            !watch(AuthFormControlsEnum.password)
        );
    };

    const hasErrorOnGeneralFields = (): boolean => {
        return !!errors.email || !!errors.password;
    };

    const generalStep = () => {
        return (
            <ScrollView key={"general-form"} contentContainerStyle={{ flexGrow: 1 }}>
                <AuthHeader
                    title={t('loginPage.title')}
                    key={"account"}
                    description={t('generic.welcome')}
                />
                {requestError && (
                    <CustomToaster
                        message={requestError}
                        onClose={handleCloseError}
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
                                    message: t('generic.errors.requiredField'),
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        testID={item.placeholder}
                                        onBlur={onBlur}
                                        mode={"outlined"}
                                        label={item.label}
                                        style={{ backgroundColor: colors.SURFACE_50 }}
                                        placeholder={item.placeholder}
                                        value={value}
                                        activeOutlineColor={colors.THEME_500}
                                        onChangeText={onChange}
                                        secureTextEntry={
                                            item.name === AuthFormControlsEnum.password
                                        }
                                        error={!!errors[item.name as keyof LoginFormData]}
                                    />

                                    <HelperText
                                        type="error"
                                        visible={!!errors[item.name as keyof LoginFormData]}
                                    >
                                        {errors[item.name as keyof LoginFormData]?.message}
                                    </HelperText>
                                </>
                            )}
                            name={item.name as keyof LoginFormData}
                        />
                        <GoogleRecaptcha
                            siteKey="6Ld-jb4pAAAAAI34pOa8uqqGX407eykhcPLDTdO7"
                            ref={recaptchaRef}
                            baseUrl="https://supplier.localforlocal.io"
                            onVerify={onVerify}
                            action={GoogleRecaptchaActionName.LOGIN}
                        />

                    </View>
                ))}

                <View style={styles.buttonsContainer}>
                    <GenericButton
                        type={ButtonTypeEnum.primary}
                        text="generic.buttons.logIn"
                        onPressHandler={handleSubmit(onSubmit)}
                        disabled={isGeneralFormInvalid()}
                    />

                    <Text
                        variant="bodyLarge"
                        style={styles.bottomText}
                    >
                        or
                    </Text>

                    <GenericButton
                        type={ButtonTypeEnum.secondary}
                        text="generic.buttons.continueDigiD"
                        onPressHandler={() => {
                            console.log("Navigate to Digi D");
                        }}
                    />
                </View>

                <View style={styles.bottomContainer}>
                    <Text style={styles.linkTextBottom}>
                        <Text variant="bodyLarge">{t('loginPage.account')} </Text>
                        <Text
                            variant="bodyLarge"
                            style={styles.hyperlinkAccent}
                            onPress={() => navigation.navigate(NavigationEnum.register)}
                        >
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
