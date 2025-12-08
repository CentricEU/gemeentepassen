import { Dimensions } from 'react-native';
import { isTablet } from './HelperUtils';

jest.spyOn(Dimensions, 'get').mockImplementation((dim: 'window' | 'screen') => {
	return {
		width: 1024,
		height: 768,
		scale: 2,
		fontScale: 2
	} as any;
});

describe('isTablet (parameterized)', () => {
	test.each([
		[375, false],
		[600, false],
		[767, false],
		[768, true],
		[800, true],
		[1024, true]
	])('returns %s when width is %i', (width, expectedResult) => {
		(Dimensions.get as jest.Mock).mockImplementation(() => ({
			width,
			height: 800,
			scale: 2,
			fontScale: 2
		}));

		expect(isTablet()).toBe(expectedResult);
	});
});
