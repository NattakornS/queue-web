import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayQueueComponent } from './admin/display-queue/display-queue.component';
import { QueueCenterPatientComponent } from './admin/queue-center-patient/queue-center-patient.component';
import { DisplayQueueDepartmentComponent } from './admin/display-queue-department/display-queue-department.component';
import { DisplayQueueGroupComponent } from './admin/display-queue-group/display-queue-group.component';
import { DisplayQueueCustomComponent } from './admin/display-queue-custom/display-queue-custom.component';
import { DisplayQueueHistoryComponent } from './admin/display-queue-history/display-queue-history.component';
import { DisplayQueueAllComponent } from './admin/display-queue-all/display-queue-all.component';
import { DisplayQueueClinicComponent } from './admin/display-queue-clinic/display-queue-clinic.component';
import { DisplayQueueFinanceComponent } from './admin/display-queue-finance/display-queue-finance.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'display-queue', component: DisplayQueueComponent },
  { path: 'display-queue-group', component: DisplayQueueGroupComponent },
  { path: 'display-queue-department', component: DisplayQueueDepartmentComponent },
  { path: 'queue-center-patient', component: QueueCenterPatientComponent },
  { path: 'display-queue-custom', component: DisplayQueueCustomComponent },
  { path: 'display-queue-history', component: DisplayQueueHistoryComponent },
  { path: 'display-queue-all', component: DisplayQueueAllComponent },
  { path: 'display-queue-clinic', component: DisplayQueueClinicComponent },
  { path: 'display-queue-finance', component: DisplayQueueFinanceComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
