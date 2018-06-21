/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EstudianteEspecialInteresadosCoordinacionComponent } from './estudiante-especial-interesados-coordinacion.component';

describe('EstudianteEspecialInteresadosCoordinacionComponent', () => {
  let component: EstudianteEspecialInteresadosCoordinacionComponent;
  let fixture: ComponentFixture<EstudianteEspecialInteresadosCoordinacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstudianteEspecialInteresadosCoordinacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstudianteEspecialInteresadosCoordinacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
