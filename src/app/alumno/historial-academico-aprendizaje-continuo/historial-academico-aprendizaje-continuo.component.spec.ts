/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HistorialAcademicoAprendizajeContinuoComponent } from './historial-academico-aprendizaje-continuo.component';

describe('HistorialAcademicoAprendizajeContinuoComponent', () => {
  let component: HistorialAcademicoAprendizajeContinuoComponent;
  let fixture: ComponentFixture<HistorialAcademicoAprendizajeContinuoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialAcademicoAprendizajeContinuoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialAcademicoAprendizajeContinuoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
