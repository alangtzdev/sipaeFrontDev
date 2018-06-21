/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GraficaAceptacionIdiomasComponent } from './grafica-aceptacion-idiomas.component';

describe('GraficaAceptacionIdiomasComponent', () => {
  let component: GraficaAceptacionIdiomasComponent;
  let fixture: ComponentFixture<GraficaAceptacionIdiomasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraficaAceptacionIdiomasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficaAceptacionIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
