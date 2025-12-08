/* eslint-disable @typescript-eslint/no-explicit-any */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CharacterLimitMessageService } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TooltipOnEllipsisDirective } from '../../shared/directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { AdditionalInformationComponent } from './additional-information.component';

describe('AdditionalInformationComponent ()', () => {
	let component: AdditionalInformationComponent;
	let fixture: ComponentFixture<AdditionalInformationComponent>;

	let originalResizeObserver: any;

	const mockCharacterLimitMessageService = {
		onTextareaValueChanged: jest.fn(),
		onClearValue: jest.fn(),
		messageCount: 0,
	};

	beforeEach(async () => {
		originalResizeObserver = global.ResizeObserver;
		global.ResizeObserver = jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));

		TestBed.overrideComponent(AdditionalInformationComponent, {
			set: {
				schemas: [NO_ERRORS_SCHEMA],
			},
		});

		await TestBed.configureTestingModule({
			imports: [
				AdditionalInformationComponent,
				TranslateModule.forRoot(),
				TooltipOnEllipsisDirective,
				NoopAnimationsModule,
				ReactiveFormsModule,
			],
			providers: [
				TranslateService,
				{ provide: CharacterLimitMessageService, useValue: mockCharacterLimitMessageService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AdditionalInformationComponent);
		component = fixture.componentInstance;
		component.additionalInformationFormGroup = new FormGroup({
			message: new FormControl(''),
		});
		fixture.detectChanges();
	});
	afterEach(() => {
		global.ResizeObserver = originalResizeObserver;
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should emit value and call characterLimitMessageService on textarea value change', () => {
		const testValue = 'Test message';
		const emitSpy = jest.spyOn(component.additionalMessageChanged, 'emit');

		component.onTextareaValueChanged(testValue);

		expect(mockCharacterLimitMessageService.onTextareaValueChanged).toHaveBeenCalledWith(
			testValue,
			component.maxLength,
		);
		expect(emitSpy).toHaveBeenCalledWith(testValue);
	});

	it('should call characterLimitMessageService.onClearValue and emit empty string on clear', () => {
		const clearSpy = jest.spyOn(mockCharacterLimitMessageService, 'onClearValue' as any);
		const emitSpy = jest.spyOn(component.additionalMessageChanged, 'emit');

		component.onClearAdditionalMessage();

		expect(clearSpy).toHaveBeenCalledWith(component.maxLength);
		expect(emitSpy).toHaveBeenCalledWith('');
	});
});
