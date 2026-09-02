import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { loadJsonFile, safeJsonParse } from '../utils/jsonHelper';
import { UserController } from '../controllers/userController';
import {
	SetupPasswordDTO,
	SetupPasswordValidateDTO,
	RegisterCitizenUserDto,
	CitizenViewDto,
	AccountDeletionReasonsDto,
	CreateUserDto,
	UserProfileDto,
	UserViewDto
} from '../apiModels/userModels';
import { Roles } from '../utils/roles.enum';
import * as userQueries from '../db/queries/userQueries';
import * as passholderQueries from '../db/queries/passholderQueries';
import * as passholderHelper from '../utils/passholderHelper';
import { AssertHelper } from '../utils/assertHelper';

let userController: UserController;

const createdUserIds: string[] = [];
const createdPassholdersIds: string[] = [];

async function createTestPassholders(): Promise<string[]> {
	const ids = await passholderHelper.CreatePassholders();
	createdPassholdersIds.push(...ids);
	return ids;
}

async function registerTestCitizen(): Promise<{
	registerData: RegisterCitizenUserDto;
	passholderIds: string[];
}> {
	const registerData = loadJsonFile<RegisterCitizenUserDto>('./testData/user-register.json');
	const ids = await createTestPassholders();
	registerData.email = `centric.automation.l4l+${Date.now()}${Math.floor(Math.random() * 10) + 1}@gmail.com`;
	registerData.passNumber = await passholderQueries.getPassNumberById(ids[0]);

	const response = await userController.registerCitizen(registerData);
	expect(response.status()).toBe(StatusCodes.OK);

	return { registerData, passholderIds: ids };
}

async function confirmCitizenAccount(passholderId: string): Promise<string> {
	const userId = await passholderQueries.getUserIdByPassholderId(passholderId);
	const token = await userQueries.getVerificationTokenByUserId(userId);

	const response = await userController.getConfirmAccount(token);
	expect(response.status()).toBe(StatusCodes.OK);

	return userId;
}

async function createTestAdmin(userController: UserController): Promise<{
	createdAdmin: CitizenViewDto;
	userCreateData: CreateUserDto;
}> {
	const userCreateData = loadJsonFile<CreateUserDto>('./testData/user-create.json');
	userCreateData.email = `centric.automation.l4l+municipality${Date.now()}${Math.floor(Math.random() * 10) + 1}@gmail.com`;

	const response = await userController.createUser(userCreateData);
	expect(response.status()).toBe(StatusCodes.NO_CONTENT);

	const userId = await userQueries.getUserIdByEmail(userCreateData.email);
	expect(userId).toBeDefined();

	const adminsLists: CitizenViewDto[] = await userQueries.getAdminsByTenantId();
	const createdAdmin = adminsLists.find((admin) => admin.email === userCreateData.email);
	expect(createdAdmin).toBeDefined();

	createdUserIds.push(userId);

	return {
		createdAdmin: createdAdmin!,
		userCreateData: userCreateData
	};
}

test.beforeAll(async () => {
	userController = await ApiFactory.getUserApi();
});

test.afterEach(async () => {
	if (createdUserIds.length > 0) {
		for (const userId of createdUserIds) {
			await userQueries.removeUserById(userId);
		}
		createdUserIds.length = 0;
	}

	if (createdPassholdersIds.length > 0) {
		for (const id of createdPassholdersIds) {
			await passholderQueries.deletePassholderById(id);
		}
		createdPassholdersIds.length = 0;
	}
});

test.describe('User Controller Tests', () => {
	test('Get citizen profile', async () => {
		const response = await userController.getCitizenProfile();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: UserProfileDto = await response.json();
		AssertHelper.hasInvalidValues(responseBody);
	});

	test('Get user by ID', async () => {
		const response = await userController.getUser(process.env.USER_CITIZEN_ID);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: UserViewDto = await response.json();
		expect(responseBody.email).toBeDefined();
	});

	test('Resend confirmation email', async () => {
		const { registerData } = await registerTestCitizen();
		const response = await userController.resendConfirmation(registerData.email);
		expect(response.status()).toBe(StatusCodes.OK);
	});

	test('Confirm user registration', async () => {
		const { passholderIds } = await registerTestCitizen();
		const userId = await confirmCitizenAccount(passholderIds[0]);

		const isEnabled = await userQueries.isAccountConfirmed(userId);
		expect(isEnabled).toBe(true);
	});

	test('Get all admins by tenant ID paginated', async () => {
		const userController = await ApiFactory.getUserApi(Roles.MUNICIPALITY);
		const response = await userController.getAllAdmin();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);
	});

	test('Count admins by tenant ID', async () => {
		const userController = await ApiFactory.getUserApi(Roles.MUNICIPALITY);
		const response = await userController.countAdminsByTenantId();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: number = safeJsonParse(await response.text());
		expect(responseBody).toBeGreaterThan(0);
	});

	test('Register citizen', async () => {
		const { registerData } = await registerTestCitizen();

		const userData: CitizenViewDto = await userQueries.getUserByEmail(registerData.email);

		expect(userData.email).toBe(registerData.email);
		expect(userData.firstName).toBeDefined();
		expect(userData.lastName).toBeDefined();
	});

	test('Delete user account', { tag: '@smoke' }, async () => {
		const { registerData, passholderIds } = await registerTestCitizen();
		const userId = await confirmCitizenAccount(passholderIds[0]);

		const userControllerWithNewCredentials = await ApiFactory.getUserApiWithCredentials(
			registerData.email,
			registerData.password,
			Roles.CITIZEN
		);

		const accountDeletionReasons = loadJsonFile<AccountDeletionReasonsDto>('./testData/user-account-deletion.json');

		const responseDelete = await userControllerWithNewCredentials.deleteAccount(accountDeletionReasons);
		expect(responseDelete.status()).toBe(StatusCodes.OK);

		const userData: CitizenViewDto = await userQueries.getUserById(userId);
		expect(userData.email).toContain('delete_');
		expect(userData.lastName).toContain('delete_');
		expect(userData.firstName).toContain('delete_');
		expect(userData.isActive).toBe(false);
	});

	test('Create a new user', { tag: '@smoke' }, async () => {
		const userController = await ApiFactory.getUserApi(Roles.MUNICIPALITY);
		const { createdAdmin, userCreateData } = await createTestAdmin(userController);

		expect(userCreateData.email).toBe(createdAdmin.email);
		expect(userCreateData.firstName).toBe(createdAdmin.firstName);
		expect(userCreateData.lastName).toBe(createdAdmin.lastName);
	});

	test('Update citizen profile', async () => {
		const profileUpdateData = loadJsonFile<UserProfileDto>('./testData/user-profile-update.json');

		profileUpdateData.firstName += `Updated${Date.now()}`;
		profileUpdateData.lastName += `Updated${Date.now()}`;
		profileUpdateData.address = `Address Updated${Date.now()}`;
		profileUpdateData.telephone = `${Date.now()}`.slice(0, 10);

		const response = await userController.updateCitizenProfile(profileUpdateData);
		expect(response.status()).toBe(StatusCodes.OK);

		const getCitizenDetails = await userQueries.getCitizenAllDetailsByEmail(process.env.EMAIL_CITIZEN!);

		expect(getCitizenDetails.firstName).toBe(profileUpdateData.firstName);
		expect(getCitizenDetails.lastName).toBe(profileUpdateData.lastName);
		expect(getCitizenDetails.address).toBe(profileUpdateData.address);
		expect(getCitizenDetails.telephone).toBe(profileUpdateData.telephone);
	});

	test('Validate setup password token', async () => {
		const userController = await ApiFactory.getUserApi(Roles.MUNICIPALITY);
		const { createdAdmin, userCreateData } = await createTestAdmin(userController);

		const token = await userQueries.getSetupPasswordTokenByEmail(createdAdmin.email);

		const setupPasswordValidateData: SetupPasswordValidateDTO = {
			token: token,
			username: createdAdmin.email
		};
		const response = await userController.validateToken(setupPasswordValidateData);
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody: boolean = safeJsonParse(await response.text());
		expect(responseBody).toBe(true);
	});

	test('Setup password', async () => {
		const userController = await ApiFactory.getUserApi(Roles.MUNICIPALITY);
		const { createdAdmin } = await createTestAdmin(userController);

		const token = await userQueries.getSetupPasswordTokenByEmail(createdAdmin.email);

		const setupPasswordData: SetupPasswordDTO = {
			token: token,
			username: createdAdmin.email,
			password: 'TestPassword123!'
		};

		const responseSetup = await userController.setupPassword(setupPasswordData);
		expect(responseSetup.status()).toBe(StatusCodes.NO_CONTENT);
	});
});
