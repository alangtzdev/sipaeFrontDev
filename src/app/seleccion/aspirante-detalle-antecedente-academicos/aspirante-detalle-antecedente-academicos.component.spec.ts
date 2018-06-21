/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AspiranteDetalleAntecedenteAcademicosComponent } from './aspirante-detalle-antecedente-academicos.component';

describe('AspiranteDetalleAntecedenteAcademicosComponent', () => {
  let component: AspiranteDetalleAntecedenteAcademicosComponent;
  let fixture: ComponentFixture<AspiranteDetalleAntecedenteAcademicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AspiranteDetalleAntecedenteAcademicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AspiranteDetalleAntecedenteAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
