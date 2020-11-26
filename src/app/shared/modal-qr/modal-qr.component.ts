
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';

import jsQR, { QRCode } from 'jsqr';

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.css']
})
export class ModalQrComponent {
  @ViewChild('video') videoElm: ElementRef;
  @ViewChild('canvas') canvasElm: ElementRef;

  videoStart = false;
  medias: MediaStreamConstraints = {
    audio: false,
    video: false,
  };

  constructor(
  ) { }

  toggleVideoMedia() {
    if (this.videoStart) {
      this.stopVideo();
    } else {
      this.startVideo();
    }
    // this.videoStart ? this.stopVideo() : this.startVideo()
  }

  startVideo() {
    this.medias.video = true;
    navigator.mediaDevices.getUserMedia(this.medias).then(
      (localStream: MediaStream) => {
        this.videoElm.nativeElement.srcObject = localStream;
        this.videoStart = true;
        this.checkImage();
      }
    ).catch(
      error => {
        console.error(error);
        this.videoStart = false;
      }
    );
  }

  stopVideo() {
    this.medias.video = false;
    this.videoElm.nativeElement.srcObject.getVideoTracks()[0].enabled = false;
    this.videoElm.nativeElement.srcObject.getVideoTracks()[0].stop();
    this.videoStart = false;
  }

  checkImage() {
    const WIDTH = this.videoElm.nativeElement.clientWidth;
    const HEIGHT = this.videoElm.nativeElement.clientHeight;
    this.canvasElm.nativeElement.width  = WIDTH;
    this.canvasElm.nativeElement.height = HEIGHT;

    const ctx = this.canvasElm.nativeElement.getContext('2d') as CanvasRenderingContext2D;

    ctx.drawImage(this.videoElm.nativeElement, 0, 0, WIDTH, HEIGHT);
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

    if (code) {
        this.openDialog(code);
    } else {
        setTimeout(() => { this.checkImage(); }, 100);
    }
  }

  openDialog(code: QRCode): void {
    // const dialogRef = this.dialog.open(DialogComponent, {
    //   width: '360px',
    //   data: {qrcode: code}
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   this.checkImage();
    // });
  }

}
