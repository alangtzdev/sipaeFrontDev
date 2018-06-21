/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PlanEstudiosDetalleDatosGeneralesComponent } from './plan-estudios-detalle-datos-generales.component';

describe('PlanEstudiosDetalleDatosGeneralesComponent', () => {
  let component: PlanEstudiosDetalleDatosGeneralesComponent;
  let fixture: ComponentFixture<PlanEstudiosDetalleDatosGeneralesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosDetalleDatosGeneralesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosDetalleDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
