import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayQueueComponent } from './admin/display-queue/display-queue.component';
import { QueueCenterPatientComponent } from './admin/queue-center-patient/queue-center-patient.component';
import { DisplayQueueDepartmentComponent } from './admin/display-queue-department/display-queue-department.component';
import { DisplayQueueGroupComponent } from './admin/display-queue-group/display-queue-group.component';
import { DisplayQueueCustomComponent } from './admin/display-queue-custom/display-queue-custom.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'display-queue', component: DisplayQueueComponent },
  { path: 'display-queue-group', component: DisplayQueueGroupComponent },
  { path: 'display-queue-department', component: DisplayQueueDepartmentComponent },
  { path: 'queue-center-patient', component: QueueCenterPatientComponent },
  { path: 'display-queue-custom', component: DisplayQueueCustomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
