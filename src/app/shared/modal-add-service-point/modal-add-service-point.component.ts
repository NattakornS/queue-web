import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../alert.service';
import { ServicePointService } from '../service-point.service';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-modal-add-service-point',
  templateUrl: './modal-add-service-point.component.html',
  styles: []
})
export class ModalAddServicePointComponent implements OnInit {

  @Input('info')
  set setItems(value: any) {
    this.servicePointId = value.service_point_id;
    this.servicePointName = value.service_point_name;
    this.servicePointAbbr = value.service_point_abbr;
    this.localCode = value.local_code;
    this.prefix = value.prefix;
    this.departmentId = value.department_id;
    this.kios = value.kios === 'Y' ? true : false;
    this.kioskReg = value.kios_reg === 'Y' ? true : false;
    this.servicePointType = value.service_point_type || '';
    this.useOldQueue = value.use_old_queue === 'Y' ? true : false;
    this.groupCompare = value.group_compare === 'Y' ? true : false;
    this.priorityQueueRunning = value.priority_queue_running === 'Y' ? true : false;
  }

  @Output('onSave') onSave: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('content') public content: any;

  modalReference: NgbModalRef;
  servicePointId: any;
  servicePointName: any;
  localCode: any;
  servicePointAbbr: any;
  departmentId: any;
  prefix: any;
  prefixes: any = [];
  servicePointTypes: any = [];

  kios: any;
  kioskReg: any;
  servicePointType: any;
  useOldQueue: any;

  departments: any[];
  groupCompare: any;
  priorityQueueRunning: any;

  constructor(
    private modalService: NgbModal,
    private alertService: AlertService,
    private servicePointService: ServicePointService,
    private departmentService: DepartmentService) {
    this.prefixes = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ',
      'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย',
      'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ',
    ];
    // this.servicePointTypes = [
    //   '',
    //   'room',
    //   'check_point'
    // ];
    this.servicePointTypes = [
     {id:1,service_point_type_name:"ห้องตรวจ"},
     {id:2,service_point_type_name:"จุดซักประวัติ"},
     {id:3,service_point_type_name:"คลินิก"},
    
    ];
  }

  ngOnInit(): void { }

  open() {
    this.modalReference = this.modalService.open(this.content, {
      ariaLabelledBy: 'modal-basic-title',
      keyboard: false,
      backdrop: 'static',
      // size: 'sm',
      // centered: true
    });

    this.getDepartments();
    this.modalReference.result.then((result) => { });

  }

  dismiss() {
    this.modalReference.close();
  }

  async getDepartments() {
    try {
      var rs: any = await this.departmentService.list();
      if (rs.statusCode === 200) {
        this.departments = rs.results;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async save() {
    if (this.servicePointName && this.localCode && this.prefix && this.departmentId) {
      try {
        var kios = this.kios ? 'Y' : 'N';
        var useOldQueue = this.useOldQueue ? 'Y' : 'N';
        var groupCompare = this.groupCompare ? 'Y' : 'N';
        var priorityQueueRunning = this.priorityQueueRunning ? 'Y' : 'N';
        var kioskReg = this.kioskReg ? 'Y' : 'N';
        const data: any = {
          servicePointName: this.servicePointName,
          localCode: this.localCode,
          prefix: this.prefix.toUpperCase(),
          departmentId: this.departmentId,
          kios: kios,
          useOldQueue: useOldQueue,
          groupCompare: groupCompare,
          priorityQueueRunning: priorityQueueRunning,
          kioskReg: kioskReg,
          servicePointType: this.servicePointType
        };

        var rs: any;

        if (this.servicePointId) {
          rs = await this.servicePointService.update(this.servicePointId, data);
        } else {
          rs = await this.servicePointService.save(data);
        }

        if (rs.statusCode === 200) {
          this.modalReference.close();
          this.onSave.emit();
        } else {
          this.alertService.error(rs.message);
        }
      } catch (error) {
        console.log(error);
        this.alertService.error('เกิดข้อผิดพลาด');
      }
    } else {
      this.alertService.error('กรุณาระบุชื่อ');
    }
  }

}
