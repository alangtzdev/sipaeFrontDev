/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProfesorStepsDatosComplementariosComponent } from './profesor-steps-datos-complementarios.component';

describe('ProfesorStepsDatosComplementariosComponent', () => {
  let component: ProfesorStepsDatosComplementariosComponent;
  let fixture: ComponentFixture<ProfesorStepsDatosComplementariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfesorStepsDatosComplementariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfesorStepsDatosComplementariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
