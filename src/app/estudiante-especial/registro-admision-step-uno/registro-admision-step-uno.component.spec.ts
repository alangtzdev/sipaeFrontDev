/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RegistroAdmisionStepUnoComponent } from './registro-admision-step-uno.component';

describe('RegistroAdmisionStepUnoComponent', () => {
  let component: RegistroAdmisionStepUnoComponent;
  let fixture: ComponentFixture<RegistroAdmisionStepUnoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroAdmisionStepUnoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAdmisionStepUnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
