import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const municipalityRoutes: Routes = [{ path: '**', redirectTo: '', pathMatch: 'full' }];

@NgModule({
	imports: [RouterModule.forChild(municipalityRoutes)],
	exports: [RouterModule],
})
export class MunicipalityRoutingModule {}
