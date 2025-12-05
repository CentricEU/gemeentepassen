import React from 'react';
import { render } from '@testing-library/react-native';
import SupplierLogoCard from './SupplierLogoCard';

jest.mock("../../assets/icons/image_b.svg", () => "PlaceholderIcon");

describe('SupplierLogoCard component', () => {
  it('renders image when logo is provided', () => {
    const logo = 'base64_encoded_image';
    const { getByTestId } = render(<SupplierLogoCard logo={logo} />);
    const image = getByTestId('supplier-logo');
    expect(image.props['source'].uri).toBe('data:image/jpeg;base64,' + logo);
  });

  it('renders placeholder icon when logo is not provided', () => {
    const logo = "";
    const { getByTestId } = render(<SupplierLogoCard logo="" />);
    const placeholderIcon = getByTestId('placeholder-icon');
    expect(placeholderIcon).toBeTruthy();
  });
});
