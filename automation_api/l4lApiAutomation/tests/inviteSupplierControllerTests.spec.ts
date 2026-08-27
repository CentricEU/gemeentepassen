import test, { expect } from '@playwright/test';
import { ApiFactory } from '../serviceApi/apiFactory';
import { StatusCodes } from '../utils/status-codes.enum';
import { loadJsonFile } from '../utils/jsonHelper';
import { InviteSupplierController } from '../controllers/inviteSupplierController';
import * as dbInviteSupplier from '../db/queries/inviteSupplierQueries';
import { InviteSupplierRequestDto, InvitationResponseDto } from '../apiModels/inviteSupplierModels';

let inviteSupplierController: InviteSupplierController;
let createdInvitationIds: string[] = [];
let testEmail: string;

test.beforeAll(async () => {
	inviteSupplierController = await ApiFactory.getInviteSupplierApi();
});

test.afterEach(async () => {
	for (const id of createdInvitationIds) {
		try {
			await dbInviteSupplier.deleteInvitationById(id);
		} catch (error) {
			console.log(`Failed to delete invitation ${id}:`, error);
		}
	}
	createdInvitationIds = [];
});

test.describe('Invite Supplier Controller Tests', () => {
	test('Invite supplier - send invitation', { tag: '@smoke' }, async () => {
		const inviteData = loadJsonFile<InviteSupplierRequestDto>('./testData/invite-supplier-create.json');

		testEmail = `test-supplier-${Date.now()}@example.com`;
		inviteData.emails = [testEmail];

		const response = await inviteSupplierController.inviteSupplier(inviteData);
		expect(response.status()).toBe(StatusCodes.OK);

		const dbInvitations = await dbInviteSupplier.getInvitationsByEmail(testEmail);
		expect(dbInvitations.length).toBeGreaterThan(0);

		createdInvitationIds = dbInvitations.map((inv) => inv.id);

		for (const dbInvitation of dbInvitations) {
			expect(dbInvitation.email).toBe(testEmail);
			expect(dbInvitation.message).toBe(inviteData.message);
			expect(dbInvitation.is_active).toBe(true);
		}
	});

	test('Get all invitations', async () => {
		const inviteData = loadJsonFile<InviteSupplierRequestDto>('./testData/invite-supplier-create.json');
		testEmail = `test-supplier-get-${Date.now()}@example.com`;
		inviteData.emails = [testEmail];

		await inviteSupplierController.inviteSupplier(inviteData);

		const response = await inviteSupplierController.getInvitations();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = await response.json();
		expect(Array.isArray(responseBody)).toBe(true);

		const ourInvitation = responseBody.find((inv: InvitationResponseDto) => inv.email === testEmail);
		if (ourInvitation) {
			createdInvitationIds.push(ourInvitation.id);
			expect(ourInvitation.message).toBe(inviteData.message);

			const dbInvitation = await dbInviteSupplier.getInvitationById(ourInvitation.id);
			expect(dbInvitation).not.toBeNull();
			expect(dbInvitation.email).toBe(ourInvitation.email);
			expect(dbInvitation.message).toBe(ourInvitation.message);
		}
	});

	test('Count invitations by tenant', async () => {
		const response = await inviteSupplierController.countInvitationsByTenantId();
		expect(response.status()).toBe(StatusCodes.OK);

		const responseBody = await response.json();
		expect(typeof responseBody).toBe('number');
		expect(responseBody).toBeGreaterThanOrEqual(0);
	});

	test('Invite supplier with multiple emails', async () => {
		const inviteData = loadJsonFile<InviteSupplierRequestDto>('./testData/invite-supplier-create.json');

		const email1 = `test-supplier-1-${Date.now()}@example.com`;
		const email2 = `test-supplier-2-${Date.now()}@example.com`;
		inviteData.emails = [email1, email2];

		const response = await inviteSupplierController.inviteSupplier(inviteData);
		expect(response.status()).toBe(StatusCodes.OK);

		const dbInvitations1 = await dbInviteSupplier.getInvitationsByEmail(email1);
		const dbInvitations2 = await dbInviteSupplier.getInvitationsByEmail(email2);

		expect(dbInvitations1.length).toBeGreaterThan(0);
		expect(dbInvitations2.length).toBeGreaterThan(0);

		createdInvitationIds = [...dbInvitations1.map((inv) => inv.id), ...dbInvitations2.map((inv) => inv.id)];
	});
});
