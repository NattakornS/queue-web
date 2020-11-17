import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WuhComponent } from './wuh/wuh.component';

const routes: Routes = [
  {
    path: 'kiosk',
    // component: LayoutComponent,
    // canActivate: [AuthGuardService],
    children: [
      { path: 'main', component: MainComponent },
      { path: 'wuh', component: WuhComponent },
      { path: '', redirectTo: 'main', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KioskRoutingModule { }
