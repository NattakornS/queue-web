import { CountdownModule } from 'ngx-countdown';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KioskRoutingModule } from './kiosk-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { WuhComponent } from "./wuh/wuh.component";

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';

import { KeyboardClassKey, MatKeyboardModule } from '@ngx-material-keyboard/core';

import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS } from '@ngx-material-keyboard/core';


const numpadLayouts: IKeyboardLayouts = {
  ...keyboardLayouts,
  'Numpad': {
    'name': 'Numpad layout',
    'keys': [
      [
        ['1'],
        ['2'],
        ['3']
      ],
      [
        ['4'],
        ['5'],
        ['6']
      ],
      [
        ['7'],
        ['8'],
        ['9']
      ],
      [
        [KeyboardClassKey.Bksp],
        ['0'],
        [KeyboardClassKey.Enter]
      ]
    ],
    'lang': ['de-CH']
  }
};

@NgModule({
  declarations: [MainComponent, WuhComponent],
  providers: [
    { provide: MAT_KEYBOARD_LAYOUTS, useValue: numpadLayouts }
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    KioskRoutingModule,
    CountdownModule,
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,

    // Material modules
    MatButtonModule,
    MatKeyboardModule,
  ]
})
export class KioskModule { }
