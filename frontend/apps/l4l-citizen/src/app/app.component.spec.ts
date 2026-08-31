import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DateAdapterModule, MultilanguageService, SidenavService } from '@frontend/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				HttpClientModule,
				BrowserAnimationsModule,
				DateAdapterModule,
				TranslateModule.forRoot(),
			],
			providers: [
				TranslateService,
				SidenavService,
				MultilanguageService,
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should have citizen application type', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.applicationType).toBe('Citizen');
	});

	it('should return menu items for navigation', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		const menuItems = app.getMenuItemsForNavigation();
		expect(menuItems).toBeDefined();
		expect(menuItems.length).toBeGreaterThan(0);
		expect(menuItems[0].path).toBe('offers');
	});
});
