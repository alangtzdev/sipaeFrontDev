/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProfesorDetalleDatosGeneralesComponent } from './profesor-detalle-datos-generales.component';

describe('ProfesorDetalleDatosGeneralesComponent', () => {
  let component: ProfesorDetalleDatosGeneralesComponent;
  let fixture: ComponentFixture<ProfesorDetalleDatosGeneralesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfesorDetalleDatosGeneralesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfesorDetalleDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
