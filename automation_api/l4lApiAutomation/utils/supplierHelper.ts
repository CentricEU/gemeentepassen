import { ApiFactory } from '../serviceApi/apiFactory';
import { loadJsonFile } from '../utils/jsonHelper';
import { RegisterSupplierRequestDto, RegisterSupplierResponseDto } from '../apiModels/supplierModels';
import { StatusCodes } from './status-codes.enum';
import * as dbSupplier from '../db/queries/supplierQueries';
import * as dbUser from '../db/queries/userQueries';
import { SupplierProfileRequestDto } from '../apiModels/supplierProfileModels';
import { SupplierProfileController } from '../controllers/supplierProfileController';

export function getDataFromJson<T>(filePath: string): T {
	const data = loadJsonFile<T>(filePath);
	if (!data) {
		throw new Error(`Failed to load data from ${filePath}`);
	}
	return data;
}

export async function createSupplier(): Promise<{
	kvk: string;
	supplierId: string;
	email: string;
}> {
	const supplierController = await ApiFactory.getSupplierApi();
	const registerData = getDataFromJson<RegisterSupplierRequestDto>('./testData/supplier-create.json');
	const kvkNumber = Math.floor(Math.random() * 90000000) + 10000000;
	registerData.kvk = kvkNumber.toString();
	registerData.email = `centric.automation.l4l+supplier${kvkNumber}@gmail.com`;

	registerData.tenantId = process.env.TENANT_ID ?? '';

	const registerResponse = await supplierController.registerSupplier(registerData);

	if (registerResponse.status() !== StatusCodes.OK) {
		throw new Error(`Failed to register supplier: ${await registerResponse.text()}`);
	}

	const supplier: RegisterSupplierResponseDto = await dbSupplier.getSupplierByKvk(registerData.kvk);

	return {
		kvk: registerData.kvk,
		supplierId: supplier.id,
		email: registerData.email
	};
}

export async function createSupplierProfile(controller: SupplierProfileController): Promise<SupplierProfileRequestDto> {
	const supplier = await createSupplier();

	const createSupplierProfileData = getDataFromJson<SupplierProfileRequestDto>('./testData/supplierProfileData.json');

	createSupplierProfileData.kvkNumber = supplier.kvk;
	createSupplierProfileData.adminEmail = supplier.email;
	createSupplierProfileData.supplierProfilePatchDto.supplierId = supplier.supplierId;
	createSupplierProfileData.supplierProfilePatchDto.cashierEmails = [
		`centric.automation.l4l+supplier${Math.random() * 1000000}@gmail.com`
	];

	await dbUser.enableUser(supplier.supplierId);

	const response = await controller.createSupplierProfile(createSupplierProfileData);

	if (response.status() == StatusCodes.CREATED) {
		return createSupplierProfileData;
	} else {
		throw new Error('Failed to create supplier profile');
	}
}
