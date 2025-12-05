import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { commonRoutingConstants } from '@frontend/common';

const supplierRoutes: Routes = [{ path: '**', redirectTo: commonRoutingConstants.dashboard, pathMatch: 'full' }];

@NgModule({
	imports: [RouterModule.forChild(supplierRoutes)],
	exports: [RouterModule],
})
export class SupplierRoutingModule {}
