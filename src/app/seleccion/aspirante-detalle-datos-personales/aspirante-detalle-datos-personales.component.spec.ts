/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AspiranteDetalleDatosPersonalesComponent } from './aspirante-detalle-datos-personales.component';

describe('AspiranteDetalleDatosPersonalesComponent', () => {
  let component: AspiranteDetalleDatosPersonalesComponent;
  let fixture: ComponentFixture<AspiranteDetalleDatosPersonalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AspiranteDetalleDatosPersonalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AspiranteDetalleDatosPersonalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
