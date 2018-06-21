/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProfesorDetalleExpecienciaComponent } from './profesor-detalle-expeciencia.component';

describe('ProfesorDetalleExpecienciaComponent', () => {
  let component: ProfesorDetalleExpecienciaComponent;
  let fixture: ComponentFixture<ProfesorDetalleExpecienciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfesorDetalleExpecienciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfesorDetalleExpecienciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
