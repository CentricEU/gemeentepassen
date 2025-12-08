import { GenericTableData } from './generic-table-data.model';

export class UserTableDto extends GenericTableData {
	public id: string;
	public fullName: string;
	public email: string;
	public createdDate: string;
}
