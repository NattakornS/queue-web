import { Directive, HostListener } from '@angular/core';
import { Screenfull } from 'screenfull';
// import * as screenfull from 'screenfull';
declare const screenfull: Screenfull;

@Directive({
  selector: '[appToggleFullscreen]'
})
export class ToggleFullscreenDirective {

  constructor() { }
  @HostListener('click') onClick(event) {
    if (screenfull.enabled) {
      screenfull.toggle(event.target);
    }
  }
  // @HostListener('click') onClick() {
  //   if (screenfull.enabled) {
  //     screenfull.toggle();
  //   }
  // }

}
