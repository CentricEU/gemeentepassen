import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
	let pipe: FileSizePipe;

	beforeEach(() => {
		pipe = new FileSizePipe();
	});

	it('create an instance', () => {
		const pipe = new FileSizePipe();
		expect(pipe).toBeTruthy();
	});

	it('transforms bytes to human-readable format', () => {
		expect(pipe.transform(1024)).toBe('1 KB');
		expect(pipe.transform(1048576)).toBe('1 MB');
		expect(pipe.transform(1073741824)).toBe('1 GB');
	});

	it('handles zero bytes', () => {
		expect(pipe.transform(0)).toBe('0 B');
	});
});
