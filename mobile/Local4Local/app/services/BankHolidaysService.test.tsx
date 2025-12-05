import { apiPath } from '../utils/constants/api';
import BankHolidaysService from './BankHolidaysService';

global.fetch = jest.fn();

describe('BankHolidaysService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('getHolidays', () => {
        it('should send a GET request to /api/bank-holidays', async () => {
       

            const mockResponseData = undefined;
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponseData),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const response = await BankHolidaysService.getHolidays(2024);

            expect(global.fetch).toHaveBeenCalledWith(
                `${apiPath}/bank-holidays?year=2024`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.any(Object),
                })
            );
            expect(response).toEqual(mockResponseData);
        });

    });

});