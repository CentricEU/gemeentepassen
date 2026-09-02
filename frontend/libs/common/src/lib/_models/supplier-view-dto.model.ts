import { StatusUpdate } from '../_enums/status-update.enum';
import { GenericTableData } from './generic-table-data.model';

export class SupplierViewDto extends GenericTableData {
	public id: string;
	public companyName: string;
	public kvk: string;
	public accountManager: string;
	public district: string;
	public category: string;
	public status: string;
	public statusUpdate?: StatusUpdate;
	public createdDate: Date;
	public province: string;
	public logo?: string;

	constructor(
		id: string,
		name: string,
		kvk: string,
		accountManager: string,
		district: string,
		category: string,
		date: Date,
		status: string,
		statusUpdate?: StatusUpdate,
		logo?: string,
	) {
		super();
		this.accountManager = accountManager;
		this.companyName = name;
		this.kvk = kvk;
		this.category = category;
		this.district = district;
		this.createdDate = date;
		this.id = id;
		this.status = status;
		this.statusUpdate = statusUpdate;
		this.logo = logo;
	}
}
