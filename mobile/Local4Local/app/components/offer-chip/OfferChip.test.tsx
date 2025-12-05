import React from 'react';
import { render } from '@testing-library/react-native';
import OfferChip from './OfferChip';
import { getOfferTypeData } from '../../utils/models/OfferType';

// Mock getOfferTypeData function
jest.mock('../../utils/models/OfferType', () => ({
  getOfferTypeData: jest.fn(),
}));

describe('OfferChip', () => {
  it('renders correctly with valid typeId', () => {
    const mockOfferData = {
      label: 'Test Label',
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
    };

    (getOfferTypeData as jest.Mock).mockReturnValue(mockOfferData);

    const { getByText, getByTestId } = render(<OfferChip typeId={1} />);

    expect(getByText('Test Label')).toBeTruthy();

    const chipContainer = getByTestId('chip-container');

    expect(chipContainer.props['style'].backgroundColor).toEqual(mockOfferData.secondaryColor);
    expect(chipContainer.props['style'].borderColor).toEqual(mockOfferData.primaryColor);
  });

});
