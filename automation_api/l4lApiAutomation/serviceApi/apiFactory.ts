import { UserController } from '../controllers/userController';
import { SupplierProfileController } from '../controllers/supplierProfileController';
import { TenantController } from '../controllers/tenantController';
import { GrantController } from '../controllers/grantController';
import { PassholderController } from '../controllers/passholderController';
import { OfferController } from '../controllers/offerController';
import { DiscountCodeController } from '../controllers/discountCodeController';
import { GetToken } from './tokenApi';
import apiContext from './apiContext';
import { Roles } from '../utils/roles.enum';
import ApiContext from './apiContext';

export class ApiFactory {
	private static async authorizeWithRole(role: Roles): Promise<void> {
		let instance = await this.getToken();
		await instance.getAccessToken(role);
	}

	private static async buildApi<T>(
		Controller: new (ctx: ApiContext) => T,
		hasToken: boolean = false,
		role?: Roles
	): Promise<T> {
		if (hasToken) {
			await this.authorizeWithRole(role);
		}
		const context = await apiContext.getInstance();
		return new Controller(context);
	}

	public static async getToken(): Promise<GetToken> {
		return this.buildApi(GetToken);
	}

	public static async getUserApi(): Promise<UserController> {
		return this.buildApi(UserController);
	}

	public static async getSupplierApi(role = Roles.SUPPLIER): Promise<SupplierProfileController> {
		return this.buildApi(SupplierProfileController, true, role);
	}

	public static async getTenantApi(role = Roles.MUNICIPALITY): Promise<TenantController> {
		return this.buildApi(TenantController, true, role);
	}

	public static async getGrantApi(role = Roles.MUNICIPALITY): Promise<GrantController> {
		return this.buildApi(GrantController, true, role);
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
}
