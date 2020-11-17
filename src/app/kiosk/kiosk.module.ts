import { CountdownModule } from 'ngx-countdown';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KioskRoutingModule } from './kiosk-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { WuhComponent } from "./wuh/wuh.component";

@NgModule({
  declarations: [MainComponent, WuhComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    KioskRoutingModule,
    CountdownModule

  ]
})
export class KioskModule { }
