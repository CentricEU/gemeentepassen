import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import common_en from "./public/locales/en/translation.json";
import common_nl from "./public/locales/nl/translation.json";

const resources = {
  en: {
    common: common_en
  },
  nl: {
    common: common_nl
  },
};

i18n
  .use(initReactI18next) 
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: "en", 
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;