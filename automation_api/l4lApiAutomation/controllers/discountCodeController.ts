import { APIResponse } from 'playwright';
import BaseApi from '../serviceApi/baseApi';
import { DiscountCodeValidation } from '../apiModels/discountCodeModels';

export class DiscountCodeController extends BaseApi{

    async getDiscountCodes() : Promise<APIResponse>{
        return this.get('discount-codes');
    }

    async getDiscountCodeById(id: string) : Promise<APIResponse>{
        return this.get(`discount-codes/${id}`);
    }

    async validateDiscountCode(data : DiscountCodeValidation) : Promise<APIResponse>{
        return this.post('discount-codes/validate', data);
    }

}