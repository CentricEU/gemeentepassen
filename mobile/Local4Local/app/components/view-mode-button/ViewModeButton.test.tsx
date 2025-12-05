import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ViewModeButton from './ViewModeButton';

jest.mock("../../assets/icons/list-bullet_r.svg", () => "ListBulletRegularIcon");
jest.mock("../../assets/icons/map_b.svg", () => "MapBoldIcon");

describe('ViewModeButton component', () => {
  it('renders without crashing', () => {
    render(<ViewModeButton />);
  });

  it('renders map icon when mapMode is true', () => {
    const { getByTestId } = render(<ViewModeButton mapMode={true} />);
    expect(getByTestId('list-icon')).toBeTruthy();
  });

  it('renders list icon when mapMode is false', () => {
    const { getByTestId } = render(<ViewModeButton mapMode={false} />);
    expect(getByTestId('map-icon')).toBeTruthy();
  });

  it('calls onPressHandler when button is pressed', () => {
    const onPressHandler = jest.fn();
    const { getByText } = render(<ViewModeButton onPressHandler={onPressHandler} />);
    fireEvent.press(getByText('generic.buttons.viewMap')); 
    expect(onPressHandler).toHaveBeenCalledTimes(1);
  });
});
