/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RegistroAdmisionStepTresComponent } from './registro-admision-step-tres.component';

describe('RegistroAdmisionStepTresComponent', () => {
  let component: RegistroAdmisionStepTresComponent;
  let fixture: ComponentFixture<RegistroAdmisionStepTresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAdmisionStepTresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAdmisionStepTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
