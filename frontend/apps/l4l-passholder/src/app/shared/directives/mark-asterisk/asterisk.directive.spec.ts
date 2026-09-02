import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MarkAsteriskDirective } from './asterisk.directive';
@Component({
	standalone: true,
	imports: [MarkAsteriskDirective],
	template: `
		<div class="field">
			<label for="email">Email</label>
			<input id="email" appRequiredInput />
		</div>
	`,
})
class HostDefaultComponent {}

@Component({
	standalone: true,
	imports: [MarkAsteriskDirective],
	template: `
		<div class="field">
			<label for="name">Name</label>
			<input id="name" [appRequiredInput] [isVisible]="true" />
		</div>
	`,
})
class HostVisibleTrueComponent {}

@Component({
	standalone: true,
	imports: [MarkAsteriskDirective],
	template: `
		<div class="field">
			<label for="a">Field A</label>
			<input id="a" appRequiredInput />
			<input id="b" appRequiredInput />
		</div>
	`,
})
class HostNoDuplicateComponent {}

@Component({
	standalone: true,
	imports: [MarkAsteriskDirective],
	template: `
		<div class="field">
			<input id="nolabel" appRequiredInput />
		</div>
	`,
})
class HostNoLabelComponent {}

describe('MarkAsteriskDirective (standalone)', () => {
	it('adds a required-asterisk to the label by default', async () => {
		await TestBed.configureTestingModule({
			imports: [HostDefaultComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostDefaultComponent);
		fixture.detectChanges();

		const label: HTMLLabelElement = fixture.debugElement.query(By.css('label')).nativeElement;

		const asterisk = label.querySelector('span.required-asterisk');
		expect(asterisk).toBeTruthy();
		expect(asterisk?.textContent).toContain('*');
	});

	it('does NOT add asterisk when isVisible=true', async () => {
		await TestBed.configureTestingModule({
			imports: [HostVisibleTrueComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostVisibleTrueComponent);
		fixture.detectChanges();

		const label: HTMLLabelElement = fixture.debugElement.query(By.css('label')).nativeElement;

		const asterisk = label.querySelector('span.required-asterisk');
		expect(asterisk).toBeFalsy();
	});

	it('does not duplicate the asterisk if another control in the same parent runs the directive', async () => {
		await TestBed.configureTestingModule({
			imports: [HostNoDuplicateComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostNoDuplicateComponent);
		fixture.detectChanges();

		const label: HTMLLabelElement = fixture.debugElement.query(By.css('label')).nativeElement;

		const asters = label.querySelectorAll('span.required-asterisk');
		expect(asters.length).toBe(1);
	});

	it('safely does nothing when no <label> is present', async () => {
		await TestBed.configureTestingModule({
			imports: [HostNoLabelComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(HostNoLabelComponent);
		expect(() => {
			fixture.detectChanges();
		}).not.toThrow();

		const asterisk = fixture.nativeElement.querySelector('span.required-asterisk');
		expect(asterisk).toBeNull();
	});
});
