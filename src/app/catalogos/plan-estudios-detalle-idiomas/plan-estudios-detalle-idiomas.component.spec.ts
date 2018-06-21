/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PlanEstudiosDetalleIdiomasComponent } from './plan-estudios-detalle-idiomas.component';

describe('PlanEstudiosDetalleIdiomasComponent', () => {
  let component: PlanEstudiosDetalleIdiomasComponent;
  let fixture: ComponentFixture<PlanEstudiosDetalleIdiomasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosDetalleIdiomasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosDetalleIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
