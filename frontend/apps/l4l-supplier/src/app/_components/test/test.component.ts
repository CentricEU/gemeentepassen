import { Component } from '@angular/core';

import { SupplierService } from '../../services/supplier-service/supplier.service';

@Component({
	selector: 'frontend-test',
	templateUrl: './test.component.html',
	styleUrls: ['./test.component.scss'],
})
export class TestComponent {
	//TODO: delete this when a corresponding request will appear

	constructor(private supplierService: SupplierService) {}

	public testMethod(): void {
		this.supplierService.getTestRequest().subscribe();
	}
}
