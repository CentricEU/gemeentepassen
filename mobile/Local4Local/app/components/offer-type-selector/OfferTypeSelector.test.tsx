import React from 'react';
import { render } from '@testing-library/react-native';
import OfferTypeSelector from './OfferTypeSelector';

jest.mock('../offer-type-button/OfferTypeButton', () => {
    return jest.fn(({ testID, type, selected, onPressHandler }: any) => (
        <button
            data-testid={testID}
            onClick={() => onPressHandler(type.typeId)}
        >
            {type.label}
        </button>
    ));
});

describe('OfferTypeSelector component', () => {
    const mockOfferChipsData = [
        { typeId: 1, label: 'Type 1' },
        { typeId: 2, label: 'Type 2' },
    ];

    it('renders without crashing', () => {
        render(<OfferTypeSelector offerChipsData={mockOfferChipsData} />);
    });

    it('renders ScrollView component', () => {
        const { getByTestId } = render(<OfferTypeSelector offerChipsData={mockOfferChipsData} />);
        expect(getByTestId('scroll-view')).toBeTruthy();
    });

});
