/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DetalleAntecedentesAcademicosComponent } from './detalle-antecedentes-academicos.component';

describe('DetalleAntecedentesAcademicosComponent', () => {
  let component: DetalleAntecedentesAcademicosComponent;
  let fixture: ComponentFixture<DetalleAntecedentesAcademicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleAntecedentesAcademicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleAntecedentesAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
