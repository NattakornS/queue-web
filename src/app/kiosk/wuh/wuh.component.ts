import { KioskService } from '../../shared/kiosk.service';
import { ServicePointService } from '../../shared/service-point.service';
import { AlertService } from 'src/app/shared/alert.service';
import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActivatedRoute, Router } from '@angular/router';
import * as mqttClient from '../../../vendor/mqtt';
import { MqttClient } from 'mqtt';
import * as Random from 'random-js';
import { CountdownComponent } from 'ngx-countdown';
import * as moment from 'moment';
import { ModalQrComponent } from '../../shared/modal-qr/modal-qr.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-wuh',
  templateUrl: './wuh.component.html',
  styleUrls: ['./wuh.component.css']
})
export class WuhComponent implements OnInit {
  jwtHelper = new JwtHelperService();
  hn: any;
  tabServicePoint = false;
  btnSelectServicePoint = false;
  tabProfile = true;
  servicePointList = [];
  suggestionList = [];
  allServiceList = [];
  token: any;
  hospname: any;
  isOffline = false;
  client: MqttClient;
  notifyUser = null;
  notifyPassword = null;
  notifyUrl: string;
  kioskId: any;
  isPrinting = false;

  cardCid: any = '';
  cardFullName: any;
  cardBirthDate: any;
  his: any;
  hisHn: any;
  hisFullName: any;
  hisBirthDate: any;

  rightRegisName: any;
  rightName: any;
  rightStartDate: any;
  rightHospital: any;
  isSendAPIGET: any;
  isSendAPIPOST: any;
  urlSendAPIGET: any;
  urlSendAPIPOST: any;

  inputTxt: any;

  registerMode: any;

  @ViewChild('mdlQr') private mdlQr: ModalQrComponent;
  modalReference: NgbModalRef;

  @ViewChild('cidInput') cidInput: ElementRef;
  @ViewChild(CountdownComponent) counter: CountdownComponent;

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private kioskService: KioskService,
    private servicePointService: ServicePointService,
    private zone: NgZone,
    private router: Router) {
      this.route.queryParams
      .subscribe(params => {
        this.token = params.token || null;
        if (this.token) {
          sessionStorage.setItem('token', params.token);
        }
        this.kioskId = +params.servicePointId || null;
        if (this.kioskId) {
          localStorage.setItem('kioskId', params.servicePointId);
        }
        const clientPrinterId = params.clientPrinterId || null;
        if (clientPrinterId) {
          localStorage.setItem('clientPrinterId', clientPrinterId);
        }
        const printSmallQueue = params.printSmallQueue || null;
        if (printSmallQueue) {
          localStorage.setItem('printSmallQueue', printSmallQueue);
        }
      });
  }

  ngOnInit() {
    try {
      this.token = this.token || sessionStorage.getItem('token');
      if (this.token) {
        const decodedToken = this.jwtHelper.decodeToken(this.token);
        this.notifyUrl = `ws://${decodedToken.NOTIFY_SERVER}:${+decodedToken.NOTIFY_PORT}`;
        this.notifyUser = decodedToken.NOTIFY_USER;
        this.notifyPassword = decodedToken.NOTIFY_PASSWORD;
        this.kioskId = localStorage.getItem('kioskId') || '1';
        this.urlSendAPIGET = localStorage.getItem('urlSendVisitGet') ? localStorage.getItem('urlSendVisitGet') : null;
        this.urlSendAPIPOST = localStorage.getItem('urlSendVisitPost') ? localStorage.getItem('urlSendVisitPost') : null;
        this.isSendAPIGET = localStorage.getItem('isSendAPIGET') === 'Y' ? true : false;
        this.isSendAPIPOST = localStorage.getItem('isSendAPIPOST') === 'Y' ? true : false;
        this.initialSocket();
        this.initWuhRight();
      } else {
        this.alertService.error('ไม่พบ TOKEN');
      }

    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async initWuhRight() {
    try {
      const rs: any = await this.kioskService.getWuhToken();
      console.log(rs);

      localStorage.setItem('wuhToken', rs.token || '');
      localStorage.setItem('nhsoCid', this.kioskService.nhsoCid() || '');
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async initialSocket() {
    // connect mqtt
    await this.connectWebSocket();
    await this.getInfoHospital();
    await this.getServicePoint();
    await this.getAllServicePoint();
    this.registerMode = await this.isRegisterMode();
  }

  connectWebSocket() {
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

    const topic = `kiosk/${this.kioskId}`;

    const that = this;

    this.client.on('message', async (topic, payload) => {
      try {
        const _payload = JSON.parse(payload.toString());
        if (_payload.ok) {
          await this.setDataFromCard(_payload.results);
        } else {
          this.clearData();
        }
      } catch (error) {
        console.log(error);
      }

    });

    this.client.on('connect', () => {
      console.log(`Connected!`);
      that.zone.run(() => {
        that.isOffline = false;
      });

      that.client.subscribe(topic, { qos: 0 }, (error) => {
        if (error) {
          that.zone.run(() => {
            that.isOffline = true;
            try {
              that.counter.restart();
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          console.log(`subscribe ${topic}`);
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

  async getInfoHospital() {
    try {
      const rs: any = await this.kioskService.getInfo(this.token);
      this.hospname = rs.info.hosname;
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async isRegisterMode() {
    const rs: any = await this.kioskService.checkMode(this.token, this.kioskId);
    return rs.result;
  }

  async getServicePoint(mode: any = 'new') {
    try {
      console.log('KIOSKID : ', this.kioskId);
      const query = `${this.hisHn}`;
      const rs: any = await this.kioskService.getServicePoint(this.token, mode, this.kioskId, query);
      if (rs.statusCode === 200) {
        this.suggestionList = rs.results;
        console.log(rs.results, this.kioskId);
        this.servicePointList = rs.results.filter(e => {
          console.log(e.local_code === `${this.kioskId}`);
          return e.local_code === `${this.kioskId}`;
        });
        console.log(this.servicePointList);
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async getPatient() {
    try {
      if (this.cardCid) {
        const rs: any = await this.kioskService.getPatient(this.token, { 'cid': this.cardCid });
        if (rs.statusCode === 200) {
          this.setDataFromHIS(rs.results);
          await this.getServicePoint('old');
        } else {
          await this.getServicePoint('new');
        }
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }


  onSelectServicePointList() {
    this.tabServicePoint = true;
    this.tabProfile = false;
  }

  cancel() {
    this.btnSelectServicePoint = true;
    this.tabServicePoint = false;
    this.tabProfile = true;
  }

  setDataFromInput(event) {
    this.cidInput.nativeElement.blur();
    // console.log(this.cidInput.nativeElement);

    this.setDataFromCard({
      cid: this.cardCid,
      fullname: '-',
      birthDate: '-'
    });
  }

  async setDataFromCard(data) {
    this.cardCid = data.cid;
    this.cardFullName = data.fullname;
    this.cardBirthDate = data.birthDate;
    if (this.cardCid) {
      await this.getPatient();
      // await this.getNhso(this.cardCid);
      await this.getWuhRight(this.cardCid);
    } else {
      this.alertService.error('บัตรมีปัญหา กรุณาเสียบใหม่อีกครั้ง', null, 1000);
    }

  }

  async setDataFromHIS(data) {
    this.his = data;
    this.hisHn = data.hn;
    this.hisFullName = `${data.title}${data.firstName} ${data.lastName}`;
    this.hisBirthDate = data.birthDate;
    if (this.his) {
      await this.setTab();
    }
  }

  setTab() {
    if (+this.servicePointList.length <= 3) {
      this.btnSelectServicePoint = false;
      this.tabServicePoint = true;
    } else {
      this.btnSelectServicePoint = true;
    }
  }

  clearData() {
    this.cardCid = '';
    this.cardFullName = '';
    this.cardBirthDate = '';

    this.hisBirthDate = '';
    this.hisFullName = '';
    this.hisHn = '';

    this.rightName = '';
    this.rightStartDate = '';
    this.rightHospital = '';

    this.tabProfile = true;
    this.btnSelectServicePoint = false;
    this.tabServicePoint = false;
  }

  async print(queueId) {
    const printerId = localStorage.getItem('clientPrinterId');
    const printSmallQueue = localStorage.getItem('printSmallQueue') || 'N';
    const topicPrint = '/printer/' + printerId;

    const data = {
      queueId: queueId,
      topic: topicPrint,
      printSmallQueue: printSmallQueue
    };
    try {
      const rs: any = await this.kioskService.print(this.token, data);
      if (rs.statusCode === 200) {
        this.clearData();
      }
      this.isPrinting = false;
    } catch (error) {
      console.log(error);
      this.isPrinting = false;
      alert('ไม่สามารถพิมพ์บัตรคิวได้');
    }
  }

  async register(servicePoint, priority) {
    this.isPrinting = true;
    let priorityId = localStorage.getItem('kiosDefaultPriority') || '1';
    if (this.his) {
      priorityId = '2';
    } else {
      priorityId = '1';
    }
    if (priority) {
      priorityId = priority;
    }
    const data = {
      hn: this.his.hn,
      vn: moment().format('x'), // 'K' + moment().format('x'),
      clinicCode: servicePoint.local_code,
      priorityId: priorityId,
      dateServ: moment().format('YYYY-MM-DD'),
      timeServ: moment().format('HHmm'),
      hisQueue: '',
      firstName: this.his.firstName,
      lastName: this.his.lastName,
      title: this.his.title,
      birthDate: this.his.engBirthDate,
      sex: this.his.sex
    };
    try {

      const rs: any = await this.kioskService.register(this.token, data);
      if (rs.statusCode === 200) {
        if (rs.queueId) {
          await this.print(rs.queueId);
          if (this.isSendAPIGET) {
            await this.kioskService.sendAPITRIGGER(this.token, 'GET', this.urlSendAPIGET, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
          }
          if (this.isSendAPIPOST) {
            await this.kioskService.sendAPITRIGGER(this.token, 'POST', this.urlSendAPIPOST, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
          }
        }
      } else {
        this.alertService.error('ไม่สามารถลงทะเบียนได้');
        this.isPrinting = false;
      }
    } catch (error) {
      this.isPrinting = false;
      console.log(error);
    }
  }

  async registerBlank(servicePoint, priority) {
    this.isPrinting = true;
    let priorityId = localStorage.getItem('kiosDefaultPriority') || '1';
    if (priority) {
      priorityId = priority;
    }
    const data = {
      hn: '99' + moment().format('x'),
      vn: moment().format('x'), // 'K' + moment().format('x'),
      clinicCode: servicePoint.local_code,
      priorityId: priorityId,
      dateServ: moment().format('YYYY-MM-DD'),
      timeServ: moment().format('HHmm'),
      hisQueue: '',
      firstName: 'ไม่มีชื่อ',
      lastName: 'ไม่มีนามสกุล',
      title: '',
      birthDate: moment().format('YYYY-MM-DD'),
      sex: '1'
    };
    try {

      const rs: any = await this.kioskService.register(this.token, data);
      if (rs.statusCode === 200) {
        if (rs.queueId) {
          await this.print(rs.queueId);
          if (this.isSendAPIGET) {
            await this.kioskService.sendAPITRIGGER(this.token, 'GET', this.urlSendAPIGET, '000000', '0000000000000', servicePoint.local_code, servicePoint.service_point_id);
          }
          if (this.isSendAPIPOST) {
            await this.kioskService.sendAPITRIGGER(this.token, 'POST', this.urlSendAPIPOST, '000000', '0000000000000', servicePoint.local_code, servicePoint.service_point_id);
          }
        }
      } else {
        this.alertService.error('ไม่สามารถลงทะเบียนได้');
        this.isPrinting = false;
      }
    } catch (error) {
      this.isPrinting = false;
      console.log(error);
    }
  }

  async getNhso(cid) {
    const nhsoToken = localStorage.getItem('nhsoToken');
    const nhsoCid = localStorage.getItem('nhsoCid');
    const data = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tok=\"http://tokenws.ucws.nhso.go.th/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <tok:searchCurrentByPID>\n         <!--Optional:-->\n         <user_person_id>${nhsoCid}</user_person_id>\n         <!--Optional:-->\n         <smctoken>${nhsoToken}</smctoken>\n         <!--Optional:-->\n         <person_id>${cid}</person_id>\n      </tok:searchCurrentByPID>\n   </soapenv:Body>\n</soapenv:Envelope>`;
    try {
      const nhso: any = {};
      const rs: any = await this.kioskService.getNhso(this.token, data);
      rs.results.forEach(v => {
        if (v.name === 'hmain') { nhso.hmain = v.elements[0].text; }
        if (v.name === 'hmain_name') { nhso.hmain_name = v.elements[0].text; }
        if (v.name === 'maininscl') { nhso.maininscl = v.elements[0].text; }
        if (v.name === 'maininscl_main') { nhso.maininscl_main = v.elements[0].text; }
        if (v.name === 'maininscl_name') { nhso.maininscl_name = v.elements[0].text; }
        if (v.name === 'startdate') { nhso.startdate = v.elements[0].text; }
        if (v.name === 'startdate_sss') { nhso.startdate_sss = v.elements[0].text; }
      });
      this.rightName = nhso.maininscl ? `${nhso.maininscl_name} (${nhso.maininscl})` : '-';
      this.rightHospital = nhso.hmain ? `${nhso.hmain_name} (${nhso.hmain})` : '-';
      this.rightStartDate = nhso.startdate ? `${moment(nhso.startdate, 'YYYYMMDD').format('DD MMM ')} ${moment(nhso.startdate, 'YYYYMMDD').get('year')}` : '-';
    } catch (error) {
      console.log(error);
      // this.alertService.error(error.message);
    }
  }

  async getWuhRight(cid) {
    const wuhToken = localStorage.getItem('wuhToken');
    // const nhsoCid = localStorage.getItem('nhsoCid');
    // const data = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tok=\"http://tokenws.ucws.nhso.go.th/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <tok:searchCurrentByPID>\n         <!--Optional:-->\n         <user_person_id>${nhsoCid}</user_person_id>\n         <!--Optional:-->\n         <smctoken>${nhsoToken}</smctoken>\n         <!--Optional:-->\n         <person_id>${cid}</person_id>\n      </tok:searchCurrentByPID>\n   </soapenv:Body>\n</soapenv:Envelope>`;
    try {
      const nhso: any = {};
      this.rightRegisName = '';
      this.rightName = '-';
      this.rightHospital = '-';
      this.rightStartDate = '';
      const rsNhso: any = await this.kioskService.getWuhNhsoRight(wuhToken, cid);
      console.log('result rsNhso : ', rsNhso);
      if (rsNhso.maininscl_main) {
        this.rightRegisName = '**สำนักงานหลักประกันสุขภาพแห่งชาติ'
        this.rightName = rsNhso.maininscl ? `${rsNhso.maininscl_name} (${rsNhso.maininscl})` : '-';
        this.rightHospital = rsNhso.hmain ? `${rsNhso.hmain_name} (${rsNhso.hmain})` : '-';
        this.rightStartDate = rsNhso.startdate ? `${moment(rsNhso.startdate, 'YYYYMMDD').format('DD MMM ')} ${moment(rsNhso.startdate, 'YYYYMMDD').get('year')}` : '-';
      }
      const rsPerson: any = await this.kioskService.getWuhPersonRight(wuhToken, cid);
      console.log('result rsPerson : ', rsPerson);
      if (rsPerson.length > 0) {
        this.rightRegisName = '** บุคคลากรมหาวิทยาลัยวลัยลักษณ์';
        this.rightName = rsPerson[0].WRKTNAME;
        this.rightHospital = rsPerson[0].DIVTHNAME;
        this.rightStartDate = moment(rsPerson[0].STARTDATE).format('YYYY-MM-DD');
      }
      const rsStd: any = await this.kioskService.getWuhStdRight(wuhToken, cid);
      console.log('result rsStd : ', rsStd);
      if (rsStd.length > 0) {
        this.rightRegisName = '** นักศึกษามหาวิทยาลัยวลัยลักษณ์';
        this.rightName = '-';
        this.rightHospital = '-';
        this.rightStartDate = '';
      }
      // rs.results.forEach(v => {
      //   if (v.name === 'hmain') { nhso.hmain = v.elements[0].text; }
      //   if (v.name === 'hmain_name') { nhso.hmain_name = v.elements[0].text; }
      //   if (v.name === 'maininscl') { nhso.maininscl = v.elements[0].text; }
      //   if (v.name === 'maininscl_main') { nhso.maininscl_main = v.elements[0].text; }
      //   if (v.name === 'maininscl_name') { nhso.maininscl_name = v.elements[0].text; }
      //   if (v.name === 'startdate') { nhso.startdate = v.elements[0].text; }
      //   if (v.name === 'startdate_sss') { nhso.startdate_sss = v.elements[0].text; }
      // });
      // this.rightName = nhso.maininscl ? `${nhso.maininscl_name} (${nhso.maininscl})` : '-';
      // this.rightHospital = nhso.hmain ? `${nhso.hmain_name} (${nhso.hmain})` : '-';
      // this.rightStartDate = nhso.startdate ? `${moment(nhso.startdate, 'YYYYMMDD').format('DD MMM ')} ${moment(nhso.startdate, 'YYYYMMDD').get('year')}` : '-';
    } catch (error) {
      console.log(error);
      // this.alertService.error(error.message);
    }
  }

  home() {
    this.router.navigate(['/admin/setting-kiosk']);

  }

  async getAllServicePoint() {
   const rs: any = await this.servicePointService.list();
   this.allServiceList = rs.results;
  }

  getServicePointById (local_code) {
    return this.allServiceList.find(x => x.local_code === local_code);
  }
  openQrModal () {
      console.log('OPEN');

      this.modalReference = this.modalService.open(ModalQrComponent, {
        ariaLabelledBy: 'modal-basic-title',
        keyboard: false,
        backdrop: 'static',
        // size: 'lg',
        // centered: true
      });

      this.modalReference.result.then((result) => {
        console.log(result);
      });

    }
    qrCodeInput(code) {
      this.cardCid = code;
      this.setDataFromInput(null);

    }
}
