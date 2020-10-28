import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerQscanComponent } from './customer-qscan.component';

describe('CustomerQscanComponent', () => {
  let component: CustomerQscanComponent;
  let fixture: ComponentFixture<CustomerQscanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerQscanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerQscanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
