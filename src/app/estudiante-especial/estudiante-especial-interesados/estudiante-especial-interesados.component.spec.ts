/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EstudianteEspecialInteresadosComponent } from './estudiante-especial-interesados.component';

describe('EstudianteEspecialInteresadosComponent', () => {
  let component: EstudianteEspecialInteresadosComponent;
  let fixture: ComponentFixture<EstudianteEspecialInteresadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstudianteEspecialInteresadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstudianteEspecialInteresadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
