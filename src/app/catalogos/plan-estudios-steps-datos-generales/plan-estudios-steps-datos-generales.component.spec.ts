/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PlanEstudiosStepsDatosGeneralesComponent } from './plan-estudios-steps-datos-generales.component';

describe('PlanEstudiosStepsDatosGeneralesComponent', () => {
  let component: PlanEstudiosStepsDatosGeneralesComponent;
  let fixture: ComponentFixture<PlanEstudiosStepsDatosGeneralesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosStepsDatosGeneralesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosStepsDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
