/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AspiranteDetalleExperienciaComponent } from './aspirante-detalle-experiencia.component';

describe('AspiranteDetalleExperienciaComponent', () => {
  let component: AspiranteDetalleExperienciaComponent;
  let fixture: ComponentFixture<AspiranteDetalleExperienciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AspiranteDetalleExperienciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AspiranteDetalleExperienciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
