import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActivityIndicator, Text } from 'react-native';

import { WeatherDataState } from '../src/components/ui/WeatherDataState';

jest.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  Text: 'Text',
  View: 'View',
}));
jest.mock('react-native-css-interop/jsx-runtime', () =>
  jest.requireActual('react/jsx-runtime'),
);

describe('WeatherDataState', () => {
  it('shows a progress indicator while weather is loading', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<WeatherDataState loading={true} />);
    });

    expect(renderer!.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(
      renderer!.root.findAllByType(Text).some(text =>
        text.props.children === 'Loading weather',
      ),
    ).toBe(true);
  });

  it('shows an offline-friendly message when weather is unavailable', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<WeatherDataState loading={false} />);
    });

    expect(renderer!.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(
      renderer!.root.findAllByType(Text).map(text => text.props.children),
    ).toContain('Weather unavailable');
    expect(
      renderer!.root.findAllByType(Text).map(text => text.props.children),
    ).toContain('Connect to refresh current conditions.');
  });
});