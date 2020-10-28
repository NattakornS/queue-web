import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerQscanComponent } from './customer-qscan/customer-qscan.component';

const routes: Routes = [
  {
    path: 'customer',
    // component: LayoutComponent,
    // canActivate: [AuthGuardService],
    children: [
      { path: 'qscan', component: CustomerQscanComponent },
      { path: '', redirectTo: 'qscan', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
