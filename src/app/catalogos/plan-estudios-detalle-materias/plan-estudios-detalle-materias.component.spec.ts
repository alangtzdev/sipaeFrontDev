/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PlanEstudiosDetalleMateriasComponent } from './plan-estudios-detalle-materias.component';

describe('PlanEstudiosDetalleMateriasComponent', () => {
  let component: PlanEstudiosDetalleMateriasComponent;
  let fixture: ComponentFixture<PlanEstudiosDetalleMateriasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosDetalleMateriasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosDetalleMateriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
