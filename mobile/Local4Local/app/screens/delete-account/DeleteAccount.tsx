import * as React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Checkbox, Text } from "react-native-paper";
import GenericButton from "../../components/generic-button/GenericButton";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import style from "./DeleteAccountStyle";
import { ScrollView } from "react-native-gesture-handler";
import ExclamationDanger from "../../assets/exclamation-danger.svg";
import UserService from "../../services/UserService";
import { AccountDeletionReason } from "../../utils/enums/accountDeletionReason";
import AuthenticationContext from "../../contexts/authentication/authentication-context";
import { useContext, useState } from "react";
import { DeleteAccountDto } from "../../utils/models/DeleteAccountDto";
import { LocationContext } from "../../contexts/location/location-provider";
import { clearToken } from "../../utils/auth/jwtSecurity";
import { NavigationEnum } from "../../utils/enums/navigationEnum";

export function DeleteAccount({ navigation }: { navigation: any }) {
  const { t } = useTranslation("common");
  const { setAuthState } = useContext(AuthenticationContext);
  const { handleClearWatch } = useContext(LocationContext);

  const [checkedReasons, setCheckedReasons] = React.useState<
    Record<AccountDeletionReason, boolean>
  >({
    [AccountDeletionReason.NO_LONGER_USING]: false,
    [AccountDeletionReason.NOT_USEFUL]: false,
    [AccountDeletionReason.SAFETY_CONCERNS]: false,
    [AccountDeletionReason.PRIVACY_CONCERNS]: false,
    [AccountDeletionReason.OTHER_REASON]: false,
  });

  const [paddingBottom, setPaddingBottom] = useState({
    paddingBottom: 148
  });

  const clearState = async () => {
    await clearToken();
    const newState = {
      token: null,
      authenticated: false,
      accountDeleted: true
    };
    setAuthState(newState);
    handleClearWatch();
  };

  const toggleCheckbox = (reason: AccountDeletionReason) => {
    setCheckedReasons((prevState) => ({
      ...prevState,
      [reason]: !prevState[reason]
    }));
  };

  const getCheckedReasons = (): AccountDeletionReason[] => {
    return Object.keys(checkedReasons)
      .filter((key) => checkedReasons[key as AccountDeletionReason])
      .map((key) => key as AccountDeletionReason);
  };

  const handleDeleteAccount = async () => {
    const deleteAccount = new DeleteAccountDto(getCheckedReasons());
    if (deleteAccount.accountDeletionReasons.length != 0) {
      try {
        await UserService.deleteAccount(deleteAccount);
        clearState();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCancel = () => navigation.navigate(NavigationEnum.profileScreen);

  const isAnyReasonChecked = Object.values(checkedReasons).some(
    (value) => value
  );

  const reasons = [
    {
      labelKey: "deleteAccount.reasons.noLongerUsing",
      reason: AccountDeletionReason.NO_LONGER_USING,
      checked: checkedReasons.NO_LONGER_USING
    },
    {
      labelKey: "deleteAccount.reasons.notUseful",
      reason: AccountDeletionReason.NOT_USEFUL,
      checked: checkedReasons.NOT_USEFUL
    },
    {
      labelKey: "deleteAccount.reasons.safetyConcerns",
      reason: AccountDeletionReason.SAFETY_CONCERNS,
      checked: checkedReasons.SAFETY_CONCERNS
    },
    {
      labelKey: "deleteAccount.reasons.privacyConcerns",
      reason: AccountDeletionReason.PRIVACY_CONCERNS,
      checked: checkedReasons.PRIVACY_CONCERNS
    },
    {
      labelKey: "deleteAccount.reasons.other",
      reason: AccountDeletionReason.OTHER_REASON,
      checked: checkedReasons.OTHER_REASON
    },
  ];

  return (
    <>
      <ScrollView
        style={style.scrollableContainer}
        contentContainerStyle={paddingBottom}
      >
        <ExclamationDanger style={style.dangerImage}></ExclamationDanger>
        <Text style={style.sorryMessage}>
          {t("deleteAccount.sorryMessage")}
        </Text>
        <Text style={style.description}>{t("deleteAccount.descritpion")}</Text>
        <Text style={style.subHeader}>{t("deleteAccount.selectReasons")}</Text>
        <View style={style.checkboxContainer}>
          {reasons.map(({ labelKey, reason, checked }) => (
            <Checkbox.Item
              key={reason}
              label={t(labelKey)}
              status={checked ? "checked" : "unchecked"}
              onPress={() => toggleCheckbox(reason)}
              labelStyle={style.checkboxLabel}
            />
          ))}
        </View>
      </ScrollView>
      <View style={style.buttonsContainer}>
        <GenericButton
          type={ButtonTypeEnum.danger}
          text="profile.deleteAccount"
          key="delete"
          onPressHandler={handleDeleteAccount}
          disabled={!isAnyReasonChecked}
        />

        <GenericButton
          type={ButtonTypeEnum.secondary}
          text="generic.buttons.cancel"
          key="cancel"
          onPressHandler={handleCancel}
        />
      </View>
    </>
  );
}
