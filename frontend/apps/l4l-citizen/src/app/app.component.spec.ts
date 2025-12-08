import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), AppComponent],
			providers: [
				{ provide: 'env', useValue: {} },
				provideHttpClient(),
				provideHttpClientTesting(),
				provideMomentDateAdapter(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
