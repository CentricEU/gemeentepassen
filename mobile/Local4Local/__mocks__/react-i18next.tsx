export const useTranslation = (namespace: string) => {
    return {
        t: jest.fn((key: string) => key),
        i18n: { language: 'en' }
    };
};