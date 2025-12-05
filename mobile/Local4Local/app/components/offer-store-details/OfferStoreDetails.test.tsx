import React from 'react';
import { render } from '@testing-library/react-native';
import OfferStoreDetails, { OfferStoreDetailsProps } from './OfferStoreDetails';
import { WorkingHour } from '../../utils/models/WorkingHour';

jest.mock("../../assets/icons/directions_walk.svg", () => "DirectionsWalkIcon");

describe('OfferStoreDetails', () => {
    const mockProps: OfferStoreDetailsProps = {
        name: 'Test Store',
        distance: 1500,
        workingHours: [new WorkingHour("id1", 0, "08:00:00", "16:00:00", true), new WorkingHour("id2", 1, "08:00:00", "16:00:00", true)]
    };
    it('renders correctly', () => {
        const { getByText, getByTestId } = render(<OfferStoreDetails name='Test Store' workingHours={mockProps.workingHours}
            distance={1500} />);

        expect(getByText('Test Store')).toBeTruthy();
        expect(getByTestId('distanceText').children[0]).toContain('1.5 km');
    });

    it('renders distance in meters if less than 1000 meters', () => {
        const { getByTestId } = render(<OfferStoreDetails {...mockProps} distance={800} />);

        expect(getByTestId('distanceText').children[0]).toContain('800 m');
    });

    it('renders distance in kilometers if greater than or equal to 1000 meters', () => {
        const { getByTestId } = render(<OfferStoreDetails {...mockProps} distance={2500} />);

        expect(getByTestId('distanceText').children[0]).toContain('2.5 km');
    });
});
