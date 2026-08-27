import { ApiFactory } from '../serviceApi/apiFactory';
import * as dbPassholder from '../db/queries/passholderQueries';
import { StatusCodes } from './status-codes.enum';

export async function CreatePassholders(): Promise<string[]> {
	const passholderController = await ApiFactory.getPassholderApi();
	const citizen_group_id = process.env.CITIZEN_GROUP_ID ?? '';
	const batchId = Math.floor(Math.random() * 1000000000);
	const response = await passholderController.createPassholders(citizen_group_id, batchId);
	if (response.status() !== StatusCodes.CREATED) {
		throw new Error(`Failed to create passholders: ${await response.text()}`);
	}
	var ids = await dbPassholder.getPassholdersIdByName(batchId);
	return ids;
}
