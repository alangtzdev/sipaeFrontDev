/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InteresadoRegistromovilidadDatosGeneralesComponent } from './interesado-registromovilidad-datos-generales.component';

describe('InteresadoRegistromovilidadDatosGeneralesComponent', () => {
  let component: InteresadoRegistromovilidadDatosGeneralesComponent;
  let fixture: ComponentFixture<InteresadoRegistromovilidadDatosGeneralesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteresadoRegistromovilidadDatosGeneralesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteresadoRegistromovilidadDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
