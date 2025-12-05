import * as React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import GenericButton from "../../components/generic-button/GenericButton";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import { useTranslation } from "react-i18next";
import style from "./DeleteAccountSuccessStyle";
import { NavigationEnum } from "../../utils/enums/navigationEnum";
import CheckedIllustration from "../../assets/icons//checked-illustration.svg";

export function DeleteAccountSuccess({ navigation }: { navigation: any }) {
  const { t } = useTranslation("common");

  const handleDone = () => navigation.navigate(NavigationEnum.landing);
  const handleRegister = () => navigation.navigate(NavigationEnum.register);

  return (
      <View style={style.content}>
      <CheckedIllustration
        style={style.checkedIllustration}
      ></CheckedIllustration>
        <Text style={style.title}>{t('deleteAccount.successfullyDeleted')}</Text>
        <Text style={style.subtitle}>
            {t('deleteAccount.successfullyDeletedMessage')}
        </Text>
        <View style={style.buttonContainer}>
          <GenericButton
            type={ButtonTypeEnum.primary}
            text="generic.buttons.done"
            key="done"
            onPressHandler={handleDone}
          />
          <GenericButton
            type={ButtonTypeEnum.secondary}
            text="generic.buttons.createNewAccount"
            key="register"
            onPressHandler={handleRegister}
          />
        </View>
      </View>
  );
}
