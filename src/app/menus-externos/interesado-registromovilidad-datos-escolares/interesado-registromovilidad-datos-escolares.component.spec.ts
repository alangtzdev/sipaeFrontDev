/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InteresadoRegistromovilidadDatosEscolaresComponent } from './interesado-registromovilidad-datos-escolares.component';

describe('InteresadoRegistromovilidadDatosEscolaresComponent', () => {
  let component: InteresadoRegistromovilidadDatosEscolaresComponent;
  let fixture: ComponentFixture<InteresadoRegistromovilidadDatosEscolaresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteresadoRegistromovilidadDatosEscolaresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteresadoRegistromovilidadDatosEscolaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
