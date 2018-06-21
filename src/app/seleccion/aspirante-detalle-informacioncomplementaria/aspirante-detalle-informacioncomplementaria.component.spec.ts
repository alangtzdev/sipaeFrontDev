/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AspiranteDetalleInformacioncomplementariaComponent } from './aspirante-detalle-informacioncomplementaria.component';

describe('AspiranteDetalleInformacioncomplementariaComponent', () => {
  let component: AspiranteDetalleInformacioncomplementariaComponent;
  let fixture: ComponentFixture<AspiranteDetalleInformacioncomplementariaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AspiranteDetalleInformacioncomplementariaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AspiranteDetalleInformacioncomplementariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
