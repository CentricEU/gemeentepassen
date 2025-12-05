import { AUTH_HEADER } from '../utils/constants/headers';
import { apiPath } from '../utils/constants/api';
import OfferService from './OfferService';
import { UseOfferDto } from '../utils/models/UseOfferDto';
import { Region } from "react-native-maps";
import { OffersMapDto } from '../utils/types/offerMapDto';
import DateUtils from "../utils/DateUtils";

global.fetch = jest.fn();

jest.mock('../utils/constants/headers', () => ({
    AUTH_HEADER: jest.fn(),
}));

describe('OfferService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMapOffersWithViewport', () => {

        it('should fetch map offers with viewport and transform coordinates', async () => {
            const mockRegion: Region = {
                latitude: 51.509865,
                longitude: -0.118092,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };

            const mockMapOffersData = {
                "{\"longitude\":4.6313375,\"latitude\":52.03413475}": [
                    {
                        id: '1',
                        title: 'Offer 1',
                        description: 'Description 1',
                        offerType: {
                            offerTypeId: 0,
                            offerTypeLabel: 'offerLabel'
                        },
                        coordinatesString: JSON.stringify({ longitude: 4.6313375, latitude: 52.03413475 }),
                        isActive: true
                    },
                    {
                        id: '2',
                        title: 'Offer 2',
                        description: 'Description 2',
                        offerType: {
                            offerTypeId: 0,
                            offerTypeLabel: 'offerLabel'
                        },
                        coordinatesString: JSON.stringify({ longitude: 4.6313375, latitude: 52.03413475 })
                    },
                ]
            } as OffersMapDto;

            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue(mockMapOffersData),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
            (AUTH_HEADER as jest.Mock).mockResolvedValue({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token'
            });

            const offers = await OfferService.getMapOffersWithViewport(mockRegion);

            const minLatitude = mockRegion.latitude - mockRegion.latitudeDelta / 2;
            const maxLatitude = mockRegion.latitude + mockRegion.latitudeDelta / 2;
            const minLongitude = mockRegion.longitude - mockRegion.longitudeDelta / 2;
            const maxLongitude = mockRegion.longitude + mockRegion.longitudeDelta / 2;

            expect(mockResponse.json).toHaveBeenCalledTimes(1);

            expect(global.fetch).toHaveBeenCalledWith(
                `${apiPath}/offers/map-with-viewport?minLatitude=${minLatitude}&maxLatitude=${maxLatitude}&minLongitude=${minLongitude}&maxLongitude=${maxLongitude}&currentDay=${DateUtils.getCurrentDay()}`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.any(Object),
                })
            );


            expect(Object.keys(offers)).toContain("{\"longitude\":4.6313375,\"latitude\":52.03413475}");

            expect(offers["{\"longitude\":4.6313375,\"latitude\":52.03413475}"]).toEqual([
                {
                    id: '1',
                    title: 'Offer 1',
                    description: 'Description 1',
                    offerType: {
                        offerTypeId: 0,
                        offerTypeLabel: 'offerLabel'
                    },
                    coordinatesString: { longitude: 4.6313375, latitude: 52.03413475 },
                    isActive: true
                },
                {
                    id: '2',
                    title: 'Offer 2',
                    description: 'Description 2',
                    offerType: {
                        offerTypeId: 0,
                        offerTypeLabel: 'offerLabel'
                    },
                    coordinatesString: { longitude: 4.6313375, latitude: 52.03413475 }
                }
            ]);

            // Additional check for transformed coordinatesString
            Object.entries(offers).forEach(([coordinates, offersArray]) => {
                offersArray.forEach(offer => {
                    expect(offer.coordinatesString).toEqual({ latitude: expect.any(Number), longitude: expect.any(Number) });
                });
            });
        });

        it('should return an empty object if fetch fails', async () => {
            const mockRegion: Region = {
                latitude: 51.509865,
                longitude: -0.118092,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };

            (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const offers = await OfferService.getMapOffersWithViewport(mockRegion);

            expect(offers).toEqual({});
            expect(console.error).toHaveBeenCalledWith(new Error('Network error'));
        });
    });

    it('should return an empty object if fetch fails', async () => {
        const mockRegion: Region = {
            latitude: 51.509865,
            longitude: -0.118092,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        };

        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const offers = await OfferService.getMapOffersWithViewport(mockRegion);

        expect(offers).toEqual({});
        expect(console.error).toHaveBeenCalledWith(new Error('Network error'));
    });
});

describe('useOffer', () => {

    it('should throw an error if the response is not ok', async () => {
        const mockData: UseOfferDto = {
            offerId: '1',
            amount: 1,
            currentTime: ''

        };

        const mockResponse = {
            ok: false,
            status: 400,
            json: jest.fn().mockResolvedValue({ error: 'Bad Request' }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        (AUTH_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
        });

        await expect(OfferService.useOffer(mockData)).rejects.toThrow('400');
    });
});

describe('getFullOffer', () => {
    it('should fetch the full offer details', async () => {
        const mockOfferId = '1';
        const mockLatitude = '51.509865';
        const mockLongitude = '-0.118092';

        const mockOffer = {
            id: mockOfferId,
            title: 'Test Offer',
        };

        const mockResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(mockOffer),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        (AUTH_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
        });

        const offer = await OfferService.getFullOffer(mockOfferId, mockLatitude, mockLongitude);

        expect(global.fetch).toHaveBeenCalledWith(
            `${apiPath}/offers/details/${mockOfferId}?latitude=${mockLatitude}&longitude=${mockLongitude}&currentDay=${DateUtils.getCurrentDay()}`,
            expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            })
        );

        expect(offer).toEqual(mockOffer);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the response is not ok', async () => {
        const mockOfferId = '1';
        const mockLatitude = '51.509865';
        const mockLongitude = '-0.118092';

        const mockResponse = {
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({ error: 'Not Found' }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
        (AUTH_HEADER as jest.Mock).mockResolvedValue({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
        });

        await expect(OfferService.getFullOffer(mockOfferId, mockLatitude, mockLongitude)).rejects.toThrow('404');
    });
});

describe('getOffers', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return an empty array if fetch fails', async () => {
        const mockCurrentPage = 1;
        const mockLatitude = 51.509865;
        const mockLongitude = -0.118092;

        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const offers = await OfferService.getOffers(mockCurrentPage, mockLatitude, mockLongitude);

        expect(offers).toEqual([]);
        expect(console.error).toHaveBeenCalledWith(new Error('Network error'));
    });
});

