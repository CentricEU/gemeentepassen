import React from 'react';
import { render } from '@testing-library/react-native';
import DiscountCodeCard from './DiscountCodeCard';
import '@testing-library/jest-native/extend-expect';
import { DiscountCodeDto } from '../../utils/types/discountCode';
import { colors } from '../../common-style/Palette';

describe('DiscountCodeCard', () => {
	const discountCode: DiscountCodeDto = {
		expirationDate: new Date('2023-12-31'),
		companyName: 'Local4Local',
		code: 'ABC123',
		offerType: {
			offerTypeId: 1,
			offerTypeLabel: 'offerTypeLabel'
		},
		companyLogo: 'https://example.com/logo.png',
		isActive: true,
		amount: 10,
		offerTitle: 'offerTitle'
	};

	it('renders correctly with discount code', () => {
		const { getByTestId, getAllByTestId } = render(
			<DiscountCodeCard discountCode={discountCode} isDiscountsListView={false} />
		);

		expect(getByTestId('discount-code')).toHaveTextContent(/A\s*B\s*C\s*1\s*2\s*3/);
		expect(getAllByTestId('details-text')[1]).toHaveTextContent('10% discounts.discount');
	});

	it('renders correctly in discounts list view', () => {
		const { getAllByTestId } = render(<DiscountCodeCard discountCode={discountCode} isDiscountsListView={true} />);

		expect(getAllByTestId('details-text')[0]).toHaveTextContent('10% discounts.discount');
		expect(getAllByTestId('details-text')[1]).toHaveTextContent('discounts.expirationDate');
	});

	it('renders correctly with inactive discount code', () => {
		const inactiveDiscountCode = {
			...discountCode,
			isActive: false
		};

		const { getByTestId, getAllByTestId } = render(
			<DiscountCodeCard discountCode={inactiveDiscountCode} isDiscountsListView={false} />
		);

		expect(getByTestId('discount-code')).toHaveTextContent(/A\s*B\s*C\s*1\s*2\s*3/);
		expect(getAllByTestId('details-text')[1]).toHaveTextContent('10% discounts.discount');
		expect(getByTestId('discount-code')).toHaveStyle({
			color: '#000'
		});
	});

	it('renders correctly with different offer types', () => {
		const offerTypes = [
			{ offerTypeId: 2, offerTypeLabel: 'offerTypeLabel2' },
			{ offerTypeId: 3, offerTypeLabel: 'offerTypeLabel3' },
			{ offerTypeId: 4, offerTypeLabel: 'offerTypeLabel4' }
		];

		offerTypes.forEach((offerType) => {
			const discountCodeWithOfferType = {
				...discountCode,
				offerType
			};

			const { getAllByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithOfferType} isDiscountsListView={false} />
			);

			expect(getAllByTestId('details-text')[1]).toHaveTextContent(offerType.offerTypeLabel);
		});
	});

	it('renders correctly with different expiration dates', () => {
		const expirationDates = ['2023-11-30', '2024-01-01', '2022-12-31'];

		expirationDates.forEach((expirationDate) => {
			const discountCodeWithExpirationDate = {
				...discountCode,
				expirationDate: new Date(expirationDate)
			};

			const { getAllByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithExpirationDate} isDiscountsListView={false} />
			);

			expect(getAllByTestId('details-text')[3]).toHaveTextContent(new Date(expirationDate).toString());
		});
	});

	it('renders correctly with different amounts', () => {
		const amounts = [5, 15, 20];

		amounts.forEach((amount) => {
			const discountCodeWithAmount = {
				...discountCode,
				amount
			};

			const { getAllByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithAmount} isDiscountsListView={false} />
			);

			expect(getAllByTestId('details-text')[1]).toHaveTextContent(`${amount}% discounts.discount`);
		});
	});

	it('renders correctly with different company logos', () => {
		const logos = [
			'https://example.com/logo1.png',
			'https://example.com/logo2.png',
			'https://example.com/logo3.png'
		];

		logos.forEach((logo) => {
			const discountCodeWithLogo = {
				...discountCode,
				companyLogo: logo
			};

			const { getByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithLogo} isDiscountsListView={false} />
			);

			expect(getByTestId('discount-code')).toBeTruthy();
		});
	});

	it('renders correctly with different company names', () => {
		const companyNames = ['Company A', 'Company B', 'Company C'];

		companyNames.forEach((companyName) => {
			const discountCodeWithCompanyName = {
				...discountCode,
				companyName
			};

			const { getByText } = render(
				<DiscountCodeCard discountCode={discountCodeWithCompanyName} isDiscountsListView={false} />
			);

			expect(getByText(companyName)).toBeTruthy();
		});
	});

	it('renders correctly with different background colors based on offer type', () => {
		const offerTypes = [
			{ offerTypeId: 1, backgroundColor: colors.INFO_400 },
			{ offerTypeId: 2, backgroundColor: colors.WARNING_900 },
			{ offerTypeId: 3, backgroundColor: colors.DANGER_400 },
			{ offerTypeId: 4, backgroundColor: colors.VIOLET }
		];

		offerTypes.forEach(({ offerTypeId, backgroundColor }) => {
			const discountCodeWithOfferType = {
				...discountCode,
				offerType: { offerTypeId, offerTypeLabel: 'offerTypeLabel' }
			};

			const { getByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithOfferType} isDiscountsListView={false} />
			);

			expect(getByTestId('content-view')).toHaveStyle({
				backgroundColor
			});
		});
	});

	it('renders correctly with different expiration dates in list view', () => {
		const expirationDates = ['2023-11-30', '2024-01-01', '2022-12-31'];

		expirationDates.forEach((expirationDate) => {
			const discountCodeWithExpirationDate = {
				...discountCode,
				expirationDate: new Date(expirationDate)
			};

			const { getAllByTestId } = render(
				<DiscountCodeCard discountCode={discountCodeWithExpirationDate} isDiscountsListView={true} />
			);

			expect(getAllByTestId('details-text')[1]).toHaveTextContent('discounts.expirationDate');
		});
	});
});
