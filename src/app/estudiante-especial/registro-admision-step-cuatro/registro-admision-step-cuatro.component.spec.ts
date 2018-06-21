/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RegistroAdmisionStepCuatroComponent } from './registro-admision-step-cuatro.component';

describe('RegistroAdmisionStepCuatroComponent', () => {
  let component: RegistroAdmisionStepCuatroComponent;
  let fixture: ComponentFixture<RegistroAdmisionStepCuatroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAdmisionStepCuatroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAdmisionStepCuatroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
