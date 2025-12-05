import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import SupplierInfo from './SupplierInfo';
import { WorkingHour } from "../../utils/models/WorkingHour";

jest.mock("../../assets/icons/clock_b.svg", () => "ClockIcon");
jest.mock("../../assets/icons/map-pin_b.svg", () => "MapPinIcon");
jest.mock("../supplier-logo-card/SupplierLogoCard", () => {
	return jest.fn(({ logo }: any) => (
		<Image source={{ uri: logo }} alt={'logo'} testID={'supplier-logo'} />
	));
});

describe('SupplierInfo component', () => {
	it('renders properly', () => {
		const name = 'supplierName';
		const address = 'supplierAddress';
		const logo = 'supplierLogo';
		const workingHours = [new WorkingHour("id1", 0, "08:00:00", "16:00:00", true), new WorkingHour("id2", 1, "08:00:00", "16:00:00", true)];
		const category = 'culture'

		const { getByTestId, getByText } = render(
			<SupplierInfo name={name} logo={logo} address={address} workingHours={workingHours} category={category} />
		);

		const supplierName = getByText('supplierName');
		const supplierAddress = getByText('supplierAddress');
		const supplierLogo = getByTestId('supplier-logo');
		const supplierCategory = getByText('culture');

		expect(supplierName).toBeTruthy();
		expect(supplierCategory).toBeTruthy();
		expect(supplierAddress).toBeTruthy();
		expect(supplierLogo.props['source'].uri).toEqual('supplierLogo');
	});
});