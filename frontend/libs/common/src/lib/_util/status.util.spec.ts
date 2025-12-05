import { GenericStatusEnum } from '../_enums/generic-status.enum';
import { StatusUtil } from './status.util';

describe('StatusUtil', () => {
	it('should map status to translation label correctly', () => {
		expect(StatusUtil.mapStatusTranslationLabel(GenericStatusEnum.ACTIVE)).toBe('status.active');
		expect(StatusUtil.mapStatusTranslationLabel(GenericStatusEnum.APPROVED)).toBe('status.approved');
		expect(StatusUtil.mapStatusTranslationLabel(GenericStatusEnum.EXPIRED)).toBe('status.expired');
		expect(StatusUtil.mapStatusTranslationLabel(GenericStatusEnum.PENDING)).toBe('status.pending');
		expect(StatusUtil.mapStatusTranslationLabel(GenericStatusEnum.REJECTED)).toBe('status.rejected');
		expect(StatusUtil.mapStatusTranslationLabel(null as unknown as GenericStatusEnum)).toBe('');
	});

	it('should get SVG icon for status correctly', () => {
		expect(StatusUtil.getSvgIconForStatus(GenericStatusEnum.ACTIVE)).toBe('check-circle_b');
		expect(StatusUtil.getSvgIconForStatus(GenericStatusEnum.EXPIRED)).toBe('minus-circle_b');
		expect(StatusUtil.getSvgIconForStatus(GenericStatusEnum.PENDING)).toBe('clock_b');
		expect(StatusUtil.getSvgIconForStatus(GenericStatusEnum.REJECTED)).toBe('cancel-circle_b');
		expect(StatusUtil.getSvgIconForStatus(null as unknown as GenericStatusEnum)).toBe('');
	});

	it('should get color class for status correctly', () => {
		expect(StatusUtil.getColorClassForStatus(GenericStatusEnum.APPROVED)).toBe('active');
		expect(StatusUtil.getColorClassForStatus(GenericStatusEnum.ACTIVE)).toBe('active');
		expect(StatusUtil.getColorClassForStatus(GenericStatusEnum.EXPIRED)).toBe('expired');
		expect(StatusUtil.getColorClassForStatus(GenericStatusEnum.PENDING)).toBe('pending');
		expect(StatusUtil.getColorClassForStatus(GenericStatusEnum.REJECTED)).toBe('rejected');
		expect(StatusUtil.getColorClassForStatus(null as unknown as GenericStatusEnum)).toBe('');
	});

	test.each([
		[true, 'check-circle_b'],
		[false, 'cancel-circle_b'],
	])('should get SVG icon for registered column (%s)', (input, expected) => {
		expect(StatusUtil.getSvgIconForIsAnswerYesNo(input)).toBe(expected);
	});

	test.each([
		[true, 'active'],
		[false, 'expired'],
	])('should get color class for registered column (%s)', (input, expected) => {
		expect(StatusUtil.getColorClassForIsAnswerYesNo(input)).toBe(expected);
	});

	test.each([
		[true, 'general.yes'],
		[false, 'general.no'],
	])('should get message for registered column (%s)', (input, expected) => {
		expect(StatusUtil.getMessagesForIsAnswerYesNo(input)).toBe(expected);
	});
});
