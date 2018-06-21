/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProfesorDetalleDatosComplementariosComponent } from './profesor-detalle-datos-complementarios.component';

describe('ProfesorDetalleDatosComplementariosComponent', () => {
  let component: ProfesorDetalleDatosComplementariosComponent;
  let fixture: ComponentFixture<ProfesorDetalleDatosComplementariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfesorDetalleDatosComplementariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfesorDetalleDatosComplementariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
