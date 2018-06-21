/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PlanEstudiosDetalleDocumentacionComponent } from './plan-estudios-detalle-documentacion.component';

describe('PlanEstudiosDetalleDocumentacionComponent', () => {
  let component: PlanEstudiosDetalleDocumentacionComponent;
  let fixture: ComponentFixture<PlanEstudiosDetalleDocumentacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanEstudiosDetalleDocumentacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanEstudiosDetalleDocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
