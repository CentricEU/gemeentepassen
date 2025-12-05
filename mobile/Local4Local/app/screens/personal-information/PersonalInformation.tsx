import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../common-style/Palette";
import { Controller, useForm } from "react-hook-form";
import { PersonalInfoFormControlsEnum } from "../../utils/enums/personalInfoFormControlsEnum";
import { HelperText, TextInput } from "react-native-paper";
import GenericButton from "../../components/generic-button/GenericButton";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import style from "./PersonalInformationStyle";
import { useContext, useEffect, useState } from "react";
import { CitizenProfileDto } from "../../utils/models/CitizenProfileDto";
import UserService from "../../services/UserService";
import { PersonalInforFormData } from "../../utils/types/personalInfoFormData"
import React from 'react';
import { NavigationEnum } from "../../utils/enums/navigationEnum";
import AuthenticationContext from "../../contexts/authentication/authentication-context";


export function PersonalInformation({ navigation }: { navigation: any }) {
  const { t } = useTranslation('common');
  const [userProfile, setUserProfile] = useState<CitizenProfileDto>();
  const { authState, setAuthState } = useContext(AuthenticationContext);

  const { control, handleSubmit, reset, setValue, trigger, formState: { errors, isDirty }, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      telephone: ""
    },
  });

  const generalFormEntries = [
    {
      name: PersonalInfoFormControlsEnum.firstName,
      label: t('registerPage.registerForm.firstName') + '*',
      placeholder: t('registerPage.registerForm.firstNamePlaceholder'),
      required: true
    },
    {
      name: PersonalInfoFormControlsEnum.lastName,
      label: t('registerPage.registerForm.lastName') + '*',
      placeholder: t('registerPage.registerForm.lastNamePlaceholder'),
      required: true
    },
    {
      name: PersonalInfoFormControlsEnum.address,
      label: t('personalInformation.address'),
      placeholder: t('personalInformation.addressPlaceholder'),
      required: false
    },
    {
      name: PersonalInfoFormControlsEnum.telephone,
      label: t('personalInformation.phoneNumber'),
      placeholder: t('personalInformation.phoneNumberPlaceholder'),
      required: false
    }
  ];

  const hasErrorOnFormFields = (): boolean => {
    return !!errors.firstName || !!errors.lastName;

  };

  const isFormUntouchedOrInvalid = () => {
    return !isDirty || isPersonalInfoFormInvalid();
  }

  const isPersonalInfoFormInvalid = () => {
    return isEmptyOnRequiredFormFields() || hasErrorOnFormFields();
  };

  const isEmptyOnRequiredFormFields = () => {
    return (
      !watch(PersonalInfoFormControlsEnum.firstName) ||
      !watch(PersonalInfoFormControlsEnum.lastName)
    );
  };

  const onSubmit = (data: PersonalInforFormData) => {
    const objectToSave = new CitizenProfileDto(userProfile?.username as string,
      data.firstName,
      data.lastName,
      data.address,
      data.telephone);
    handleUpdateInformation(objectToSave);
  };

  const handleUpdateInformation = async (data: CitizenProfileDto) => {
    try {
      const updatedProfile = await UserService.updateUserInformation(data);
      setAuthState({ ...authState, profile: updatedProfile });
      navigation.navigate(NavigationEnum.profileScreen);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCitizenProfile();
  }, []);

  const getCitizenProfile = async () => {
    try {
      const profile: CitizenProfileDto = await UserService.getCitizenProfile();
      setUserProfile(profile);
      reset(profile);
    } catch (error) {
      console.error(error);
    }
  };

  const removeTextFromInput = (name: string) => {
    setValue(name as keyof PersonalInforFormData, '');
    trigger(name as keyof PersonalInforFormData);
  };

  const personalInfoForm = () => {
    return (
      <View style={style.container}>
        <View style={style.formContainer}>
          {generalFormEntries.map((item, index) => (
            <View key={item.name + index}>
              <Controller
                key={item.name}
                control={control}
                rules={{
                  maxLength: 256,
                  required: item.required ? {
                    value: item.required,
                    message: t('generic.errors.requiredField'),
                  } : false,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      onBlur={onBlur}
                      mode={"outlined"}
                      label={item.label}
                      style={{ backgroundColor: colors.SURFACE_50 }}
                      placeholder={item.placeholder}
                      value={value}
                      testID={item.name + "_id"}
                      activeOutlineColor={colors.THEME_500}
                      onChangeText={onChange}
                      right={value && (value as string).length > 0 && <TextInput.Icon icon="close" onPress={() => removeTextFromInput(item.name)} />}
                    />

                    <HelperText
                      type="error"
                      visible={!!errors[item.name]}
                    >
                      {t("generic.errors.requiredField")}
                    </HelperText>
                  </>
                )}
                name={item.name}
              />
            </View>
          ))}
        </View>

        <GenericButton
          type={ButtonTypeEnum.primary}
          text="generic.buttons.saveChanges"
          onPressHandler={handleSubmit(onSubmit)}
          disabled={isFormUntouchedOrInvalid()}
        />
      </View>
    );
  };

  return personalInfoForm();
}

