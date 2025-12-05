import { Pipe, PipeTransform } from '@angular/core';

const FILE_SIZE_UNITS: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

@Pipe({
	name: 'fileSizePipe',
})
export class FileSizePipe implements PipeTransform {
	public transform(sizeInBytes: number): string {
		if (sizeInBytes === 0) {
			return '0 B';
		}

		const index = parseInt(String(Math.floor(Math.log(sizeInBytes) / Math.log(1024))), 10);
		return Math.round(sizeInBytes / Math.pow(1024, index)) + ' ' + FILE_SIZE_UNITS[index];
	}
}
