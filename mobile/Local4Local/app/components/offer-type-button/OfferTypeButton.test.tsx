import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OfferTypeButton from './OfferTypeButton';

describe('OfferTypeButton', () => {
  test('renders correctly', () => {
    const onPressHandler = jest.fn();
    const type = { typeId: 'example', label: 'Example', icon: null };
    const { getByText } = render(
      <OfferTypeButton type={type} selected={false} onPressHandler={onPressHandler} />
    );
    expect(getByText('Example')).toBeTruthy();
  });

  test('calls onPressHandler with correct type on press', () => {
    const onPressHandler = jest.fn();
    const type = { typeId: 'example', label: 'Example', icon: null };
    const { getByText } = render(
      <OfferTypeButton type={type} selected={false} onPressHandler={onPressHandler} />
    );
    fireEvent.press(getByText('Example'));
    expect(onPressHandler).toHaveBeenCalledWith('example');
  });

  test('renders icon with correct props when type.icon exists and selected is true', () => {
    const onPressHandler = jest.fn();
    const mockIcon = <svg />;
    const type = { typeId: 'example', label: 'Example', icon: mockIcon };
    const { getByTestId } = render(
      <OfferTypeButton type={type} selected={true} onPressHandler={onPressHandler} />
    );

    const renderedIcon = getByTestId('icon');

    expect(renderedIcon.props['fill']).toEqual('#fff'); 
    expect(renderedIcon.props['marginRight']).toEqual(8);
  });
});
