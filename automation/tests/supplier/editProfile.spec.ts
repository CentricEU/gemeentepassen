import {test, expect} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import {EditProfilePage} from '../../resources/pages/editProfilePage';
import * as userData from '../../resources/files/userData';
import * as api from '../../resources/api/loginAndLogout';
import * as NL_translation from '../../resources/files/i18n/nl-NL';

test.beforeEach(async ({page}) => {
    await page.goto('/');
    await LoginPage.loginIntoAppWithValidation(page, userData.supplier.username, userData.supplier.password);
    await page.goto('/' + 'profile/edit');
    await expect(page.locator('li:nth-of-type(2)')).toHaveText(NL_translation.general.pages.editProfile);
});

test('Change image profile and validate the result', async ({page}) => {
    await EditProfilePage.changeImageProfile(page);
});

test('Change general information fields and validate the results', async ({page}) => {
    await EditProfilePage.clearGeneralInformationAndValidateErrorMessage(page);

    await EditProfilePage.setupNewGeneralInformationValues(page,
        'Vennootschap onder firma (vof)', 'Sociaal', 'Cultuur', 'Theater');
});

test('Change contact information fields and validate the results', async ({page}) => {
    await EditProfilePage.clearContactInformationAndValidateErrorMessage(page);

    await EditProfilePage.setupNewContactInformationValues(page);
});

test.afterEach(async ({page}) => {
    const {token} = await api.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userData.supplier.username, userData.supplier.password);
    await api.logoutUser(page, token);
});