
import { Component, OnInit, ViewChild, ElementRef, Inject, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import jsQR, { QRCode } from 'jsqr';

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.css']
})
export class ModalQrComponent {
  modalReference: NgbModalRef;
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();

  constructor (
    private modalService: NgbModal,
  ) {}
  openModal() {
    this.modalReference = this.modalService.open(QrComponent, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      backdrop: 'static',
      // size: 'lg',
      // centered: true
    });
    this.modalReference.componentInstance.startVideo();
    this.modalReference.result.then((result) => {
      console.log("result : ", result);
      this.finished.emit(result.data);
    });
  }

}

@Component({
  selector: 'app-comp-qr',
  template:
  `
  <div fxLayout="row wrap" fxLayoutAlign="center center">
  <div class="modal-header">
    <h3 class="modal-title" id="modal-basic-title">สแกน</h3>
    <button type="button" class="close" aria-label="Close" (click)="dismiss('')">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="card" fxFlex="85">
    <div>
      <div>
        <div fxLayout="row wrap">

          <!-- Video -->
          <div class="video-row" fxFlex="100">
            <video class="video" id="video" #video autoplay playsinline></video>
          </div>
          <!-- Canvas -->
          <div fxFlex="100" style="display:none">
            <canvas class="video" id="canvas" #canvas></canvas>
          </div>

          <!-- Button -->
          <!-- <div fxFlex="100" fxLayoutAlign="space-around center">
            <ng-container *ngIf="!videoStart">
              <button mat-fab class="mat-elevation-z1" (click)="toggleVideoMedia()" [disabled]="videoStart" color="primary" aria-label="videocam icon-button">
                <div>videocam</div>
              </button>
            </ng-container>

            <ng-container *ngIf="videoStart">
              <button mat-fab (click)="toggleVideoMedia()" [disabled]="!videoStart" color="warn" aria-label="videocam icon-button">
                <div>videocam_off</div>
              </button>
            </ng-container>
          </div>-->

        </div>
      </div>
    </div>
  </div>
</div>

  `,
  styleUrls: ['./modal-qr.component.css']
})
export class QrComponent {
  // @ViewChild('content') public content: any;
  @ViewChild('video', {read: ElementRef}) public videoElm: ElementRef;
  @ViewChild('canvas', {read: ElementRef}) public canvasElm: ElementRef;



  videoStart = false;
  medias: MediaStreamConstraints = {
    audio: false,
    video: false,
  };

  constructor(
    public modalReference: NgbActiveModal
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
    this.dismiss(code);
    // const dialogRef = this.dialog.open(DialogComponent, {
    //   width: '360px',
    //   data: {qrcode: code}
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   this.checkImage();
    // });
  }
  dismiss(data) {
    this.stopVideo();
    this.modalReference.close(data);
  }

}
