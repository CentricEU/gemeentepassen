import { Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import style from "./ChangeLanguageStyle";
import EnFlag from '../../assets/icons/flag-en.svg'
import NlFlag from '../../assets/icons/flag-nl.svg'
import { Divider, Icon } from "react-native-paper";
import common from "../../common-style/CommonStyle";
import React, { useState } from "react";
import { colors } from "../../common-style/Palette";


export function ChangeLanguage({ }: { navigation: any }) {
  const { i18n } = useTranslation("common");
  const { t } = useTranslation('common');
  const [currentLanguage, setCurrentLanguage] = useState<any>(i18n.language);

  const onChangeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
  }

  const languages = [
    {
      title: 'en',
      icon: <EnFlag height={24} />
    },
    {
      title: 'nl',
      icon: <NlFlag height={24} />
    }
  ];

  return (
    <View style={style.container}>
      {languages.map((language, index) => (
        <>
          <TouchableOpacity key={language.title + index} testID={"button-" + language.title} style={style.languageItem} onPress={() => onChangeLanguage(language.title)}>
            <View style={style.languageText}>
              {language.icon}
              <Text>{t(`profile.language.${language.title}`)}</Text>
            </View>
            {language.title === currentLanguage &&
              <Icon
                testID="checked-icon"
                source='check'
                size={24}
                color={colors.SUCCESS}
              />}
          </TouchableOpacity>
          <Divider bold
            style={common.flexDivider}
          />
        </>))
      }
    </View>
  );
}

