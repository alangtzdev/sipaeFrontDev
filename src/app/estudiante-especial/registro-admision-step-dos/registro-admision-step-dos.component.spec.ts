/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RegistroAdmisionStepDosComponent } from './registro-admision-step-dos.component';

describe('RegistroAdmisionStepDosComponent', () => {
  let component: RegistroAdmisionStepDosComponent;
  let fixture: ComponentFixture<RegistroAdmisionStepDosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAdmisionStepDosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAdmisionStepDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
