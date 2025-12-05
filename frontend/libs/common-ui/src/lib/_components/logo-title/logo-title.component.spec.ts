import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LogoTitleComponent } from './logo-title.component';

describe('LogoTitleComponent', () => {
	let component: LogoTitleComponent;
	let fixture: ComponentFixture<LogoTitleComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LogoTitleComponent],
			imports: [TranslateModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(LogoTitleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
