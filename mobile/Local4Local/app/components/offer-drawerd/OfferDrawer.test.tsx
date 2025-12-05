import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OfferDrawer from './OfferDrawer';
import OfferContext from '../../contexts/offer/offer-context';
import { OfferMobileDetailDto } from '../../utils/types/offerMobileDetailDto';


jest.mock('../offer-card/OfferCard', () => (props: any) => (
    <div {...props}>OfferCard Mock</div>
));

describe('OfferDrawer', () => {
    const mockSetOfferState = jest.fn();
    const mockOfferState = {
        isDisplayed: true,
        offer: {
            id: '1',
            title: 'Sample Offer',
            companyAddress: '123 Sample St',
            companyLogo: 'http://example.com/logo.png',

        } as OfferMobileDetailDto
    };

    const renderComponent = (offerState = mockOfferState) => {
        return render(
            <OfferContext.Provider value={{ offerState, setOfferState: mockSetOfferState }}>
                <OfferDrawer navigation={{}} />
            </OfferContext.Provider>
        );
    };

    it('should render the modal when offerState.isDisplayed is true', () => {
        const { getByTestId } = renderComponent();

        expect(getByTestId('modal')).toBeTruthy();
        expect(getByTestId('testOverlay')).toBeTruthy();
    });

    it('should call setOfferState with new state when overlay is pressed', () => {
        const { getByTestId } = renderComponent();
        const overlay = getByTestId('testOverlay');

        fireEvent.press(overlay);

        expect(mockSetOfferState).toHaveBeenCalledWith({ ...mockOfferState, isDisplayed: false });
    });

});
