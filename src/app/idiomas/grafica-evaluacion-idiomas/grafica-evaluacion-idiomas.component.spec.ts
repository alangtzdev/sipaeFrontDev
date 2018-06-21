/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GraficaEvaluacionIdiomasComponent } from './grafica-evaluacion-idiomas.component';

describe('GraficaEvaluacionIdiomasComponent', () => {
  let component: GraficaEvaluacionIdiomasComponent;
  let fixture: ComponentFixture<GraficaEvaluacionIdiomasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraficaEvaluacionIdiomasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficaEvaluacionIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
