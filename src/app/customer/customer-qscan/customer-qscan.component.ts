import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MqttClient } from 'mqtt';
import { QueueService } from 'src/app/shared/queue.service';
import * as Random from 'random-js';
import * as mqttClient from '../../../vendor/mqtt';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertService } from 'src/app/shared/alert.service';
import { CountdownComponent } from 'ngx-countdown';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-qscan',
  templateUrl: './customer-qscan.component.html',
  styleUrls: ['./customer-qscan.component.css']
})
export class CustomerQscanComponent implements OnInit {
  @ViewChild(CountdownComponent) counter: CountdownComponent;
  queueId: string;
  result: any;
  topic: any;
  jwtHelper = new JwtHelperService();
  servicePointTopic = null;
  servicePointId: any;
  servicePointName: any;
  workingItems: any = [];
  workingItemsHistory: any = [];
  currentQueueNumber: any;
  currentRoomNumber: any;
  currentHn: any;
  currentRoomName: any;

  isOffline = false;

  client: MqttClient;
  notifyUser = null;
  notifyPassword = null;

  isSound = true;
  isPlayingSound = false;

  playlists: any = [];
  notifyUrl: string;
  token: string;

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private qService: QueueService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.queueId = params['queueId'];
      this.topic = params['topic'];
      this.token = params.token || null;
        if (this.token) {
          sessionStorage.setItem('token', params.token);
        }
        const resposne = await this.qService.getQueueInfo(this.queueId);
        console.log(resposne);

        this.result = resposne['results'];
        this.servicePointId = this.result['service_point_id'] || null;
        this.servicePointName = this.result['service_point_name'] || null;
        try {
          const token = this.token || sessionStorage.getItem('token');
          console.log('TOKEN : ', token);

          if (token) {
            const decodedToken = this.jwtHelper.decodeToken(token);
            this.servicePointTopic = decodedToken.SERVICE_POINT_TOPIC;
            this.notifyUrl = `ws://${decodedToken.NOTIFY_SERVER}:${+decodedToken.NOTIFY_PORT}`;
            this.notifyUser = decodedToken.NOTIFY_USER;
            this.notifyPassword = decodedToken.NOTIFY_PASSWORD;
            // this.speakSingle = decodedToken.SPEAK_SINGLE === 'Y' ? true : false;

            if (sessionStorage.getItem('servicePoints')) {
              const _servicePoints = sessionStorage.getItem('servicePoints');
              const jsonDecodedServicePoint = JSON.parse(_servicePoints);
              if (jsonDecodedServicePoint.length === 1) {
                // this.onSelectedPoint(jsonDecodedServicePoint[0]);
              } else if (this.servicePointId && this.servicePointName) {
                // this.onSelectedPoint({ 'service_point_id': this.servicePointId, 'service_point_name': this.servicePointName });
                this.initialSocket();
              }
            } else {
              if (this.servicePointId) {
                // this.onSelectedPoint({ 'service_point_id': this.servicePointId, 'service_point_name': this.servicePointName });
                this.initialSocket();
              } else {
                this.initialSocket();
              }
            }
          } else {
            this.alertService.error('ไม่พบ token');
          }
        } catch (error) {
          this.alertService.error('เกิดข้อผิดพลาด');
          console.log(error);
        }
    });

  }

  public ngOnDestroy() {
    try {
      this.client.end(true);
    } catch (error) {
      console.log(error);
    }
  }

  async initialSocket() {
    // connect mqtt
    this.connectWebSocket();
    // this.result = await this.qService.getQueueInfo(this.queueId);
    // this.getCurrentQueue();
    // this.getWorkingHistory();
  }

  connectWebSocket() {

    try {
      this.client.end(true);
    } catch (error) {

    }
    const rnd = new Random();
    const username = sessionStorage.getItem('username');
    const strRnd = rnd.integer(1111111111, 9999999999);
    const clientId = `${username}-${strRnd}`;

    try {
      this.client = mqttClient.connect(this.notifyUrl, {
        clientId: clientId,
        username: this.notifyUser,
        password: this.notifyPassword
      });
    } catch (error) {
      console.log(error);
    }

    // const topic = `${this.servicePointTopic}/${this.servicePointId}`;
    // const topic = environment.notifyTopic;
    const that = this;

    this.client.on('message', async (topic, payload) => {
      // that.getCurrentQueue();
      // that.getWorkingHistory();
      const resposne = await that.qService.getQueueInfo(that.queueId);
      that.result = resposne['results'];
      console.log(that.result);

      try {
        const _payload = JSON.parse(payload.toString());
        console.log(_payload);

        // if (that.isSound) {
        //   if (+that.servicePointId === +_payload.servicePointId) {
        //     // play sound
        //     const sound = { queueNumber: _payload.queueNumber, roomNumber: _payload.roomNumber.toString(), isInterview: _payload.isInterview, roomId: _payload.roomId };
        //     that.playlists.push(sound);
        //     // that.prepareSound();
        //   }
        // }
      } catch (error) {
        console.log(error);
      }

    });
    this.client.on('connect', () => {
      console.log('Connected!');
      that.zone.run(() => {
        that.isOffline = false;
      });

      that.client.subscribe(that.topic, (error) => {
        if (error) {
          that.zone.run(() => {
            that.isOffline = true;
            try {
              that.counter.restart();
            } catch (error) {
              console.log(error);
            }
          });
        }
      });
    });

    this.client.on('close', () => {
      console.log('MQTT Conection Close');
    });

    this.client.on('error', (error) => {
      console.log('MQTT Error');
      that.zone.run(() => {
        that.isOffline = true;
        that.counter.restart();
      });
    });

    this.client.on('offline', () => {
      console.log('MQTT Offline');
      that.zone.run(() => {
        that.isOffline = true;
        try {
          that.counter.restart();
        } catch (error) {
          console.log(error);
        }
      });
    });
  }

  onFinished() {
    console.log('Time finished!');
    this.connectWebSocket();
  }
}
