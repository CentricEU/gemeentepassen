import { UserController } from '../controllers/userController';
import { SupplierProfileController } from '../controllers/supplierProfileController';
import { SupplierController } from '../controllers/supplierController';
import { TenantController } from '../controllers/tenantController';
import { PassholderController } from '../controllers/passholderController';
import { OfferController } from '../controllers/offerController';
import { DiscountCodeController } from '../controllers/discountCodeController';
import { BankHolidaysController } from '../controllers/bankHolidaysController';
import { CitizenGroupController } from '../controllers/citizenGroupController';
import { DashboardController } from '../controllers/dashboardController';
import { DropdownDataController } from '../controllers/dropdownDataController';
import { InviteSupplierController } from '../controllers/inviteSupplierController';
import { OfferSearchHistoryController } from '../controllers/offerSearchHistoryController';
import { OfferTransactionController } from '../controllers/offerTransactionController';
import { WorkingHoursController } from '../controllers/workingHoursController';
import { GetToken } from './tokenApi';
import apiContext from './apiContext';
import { Roles } from '../utils/roles.enum';
import ApiContext from './apiContext';
import { BenefitController } from '../controllers/benefitController';
import { SepaController } from '../controllers/sepaController';

export class ApiFactory {
	private static async authorizeWithRole(role: Roles): Promise<string> {
		const tokenApi = await this.getToken();
		return await tokenApi.getAccessToken(role);
	}

	private static async buildApi<T>(
		Controller: new (ctx: ApiContext) => T,
		hasToken: boolean = false,
		role?: Roles
	): Promise<T> {
		let token: string | undefined;
		if (hasToken) {
			token = await this.authorizeWithRole(role);
		}
		const context = await apiContext.getInstance(token);
		return new Controller(context);
	}

	public static async getUserApiWithCredentials(
		email: string,
		password: string,
		role: Roles
	): Promise<UserController> {
		const tokenApi = await this.getToken();
		const token = await tokenApi.getAccessTokenWithCredentials(email, password, role);
		const context = await apiContext.getInstance(token);
		return new UserController(context);
	}

	public static async getToken(): Promise<GetToken> {
		return this.buildApi(GetToken);
	}

	public static async getUserApi(role = Roles.CITIZEN): Promise<UserController> {
		return this.buildApi(UserController, true, role);
	}

	public static async getSupplierProfileApi(role = Roles.SUPPLIER): Promise<SupplierProfileController> {
		return this.buildApi(SupplierProfileController, true, role);
	}

	public static async getSupplierApi(role = Roles.MUNICIPALITY): Promise<SupplierController> {
		return this.buildApi(SupplierController, true, role);
	}

	public static async getTenantApi(role = Roles.MUNICIPALITY): Promise<TenantController> {
		return this.buildApi(TenantController, true, role);
	}

	public static async getPassholderApi(role = Roles.MUNICIPALITY): Promise<PassholderController> {
		return this.buildApi(PassholderController, true, role);
	}

	public static async getOfferApi(role = Roles.SUPPLIER): Promise<OfferController> {
		return this.buildApi(OfferController, true, role);
	}

	public static async getDiscountCodeApi(role = Roles.CITIZEN): Promise<DiscountCodeController> {
		return this.buildApi(DiscountCodeController, true, role);
	}

	public static async getBenefitApi(role = Roles.MUNICIPALITY): Promise<BenefitController> {
		return this.buildApi(BenefitController, true, role);
	}

	public static async getBankHolidaysApi(role = Roles.CITIZEN): Promise<BankHolidaysController> {
		return this.buildApi(BankHolidaysController, true, role);
	}

	public static async getCitizenGroupApi(role = Roles.MUNICIPALITY): Promise<CitizenGroupController> {
		return this.buildApi(CitizenGroupController, true, role);
	}

	public static async getDashboardApi(role = Roles.SUPPLIER): Promise<DashboardController> {
		return this.buildApi(DashboardController, true, role);
	}

	public static async getDropdownDataApi(role = Roles.SUPPLIER): Promise<DropdownDataController> {
		return this.buildApi(DropdownDataController, true, role);
	}

	public static async getInviteSupplierApi(role = Roles.MUNICIPALITY): Promise<InviteSupplierController> {
		return this.buildApi(InviteSupplierController, true, role);
	}

	public static async getOfferSearchHistoryApi(role = Roles.CITIZEN): Promise<OfferSearchHistoryController> {
		return this.buildApi(OfferSearchHistoryController, true, role);
	}

	public static async getOfferTransactionApi(role = Roles.SUPPLIER): Promise<OfferTransactionController> {
		return this.buildApi(OfferTransactionController, true, role);
	}

	public static async getSepaApi(role = Roles.MUNICIPALITY): Promise<SepaController> {
		return this.buildApi(SepaController, true, role);
	}

	public static async getWorkingHoursApi(role = Roles.SUPPLIER): Promise<WorkingHoursController> {
		return this.buildApi(WorkingHoursController, true, role);
	}
}
