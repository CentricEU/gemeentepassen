import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class AuthMock {
	private mockEmitter = new EventEmitter<boolean>();
	public id = '1';

	get loginEventEmitter(): EventEmitter<boolean> {
		return this.mockEmitter;
	}

	get tenantId(): string {
		return this.id;
	}

	emitEvent(data: boolean) {
		this.mockEmitter.emit(data);
	}
}
