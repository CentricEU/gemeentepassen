import {test} from '@playwright/test';
import {LoginPage} from '../../resources/pages/loginPage';
import {CommonFunctions} from '../../resources/utils/commonFunctions';
import {SupplierProfileGenerator} from '../../resources/utils/generateSupplierProfile';
import * as api from '../../resources/api/createSupplierUser';
import * as auth from '../../resources/api/loginAndLogout';
import {DashboardSupplier} from '../../resources/pages/supplierDashboard';
import {DataBase} from '../../resources/db/dbConnection';
import {DownloadFile} from "../../resources/utils/downloadFile";

const supplierProfileGenerator = new SupplierProfileGenerator();
const db = new DataBase();

let userWithoutQRCode: any;
let userWithQRCode: any;

test.beforeEach(async ({page}) => {
    await page.goto('/');
});

test('Ensure that the QR code is not available if the user approval is pending.', async ({page}) => {
    const userPassWithoutQRCode = await CommonFunctions.generateRandomPassword(page, 12);
    userWithoutQRCode = supplierProfileGenerator.generateProfile();

    // Create a supplier user and set up the profile
    await api.createSupplierAndSetupProfileWithoutApprove(page, userWithoutQRCode, userPassWithoutQRCode);

    await LoginPage.loginIntoAppWithValidation(page, userWithoutQRCode.email, userPassWithoutQRCode);

    await DashboardSupplier.validateApprovalInfo(page);
    await DashboardSupplier.validateQrCodeBeforeApproval(page);
});

test('Ensure that the QR code is available when the user is approved', async ({page}) => {
    const userPassWithQRCode = await CommonFunctions.generateRandomPassword(page, 12);
    userWithQRCode = supplierProfileGenerator.generateProfile();

    // Create approved supplier user
    await api.createApprovedSupplier(page, userWithQRCode, userPassWithQRCode);

    await LoginPage.loginIntoAppWithValidation(page, userWithQRCode.email, userPassWithQRCode);

    await DashboardSupplier.validateQrCodeAfterApproval(page);

    await DashboardSupplier.downloadQRCodeAndValidate(page);

})

test.afterEach(async ({page, browser}) => {
    try {
        // Logout the user
        if (userWithoutQRCode) {
            const {token} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userWithoutQRCode.email, userWithoutQRCode.password);
            await auth.logoutUser(page, token);
        }
        if (userWithQRCode) {
            const {token} = await auth.getTokenAndSupplierIdFromAuthentication(page, 'ROLE_SUPPLIER', userWithQRCode.email, userWithQRCode.password);
            await auth.logoutUser(page, token);
        }

        // Delete the downloaded image
        await DownloadFile.deleteDownloadFolder();

        if (userWithoutQRCode) {
            await db.executeQueryFromFile('../../resources/db/deleteUser.sql', userWithoutQRCode);
            console.log(`User without QR Code deleted`);
        }

        if (userWithQRCode) {
            await db.executeQueryFromFile('../../resources/db/deleteUser.sql', userWithQRCode);
            console.log(`User with QR Code deleted`);
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});