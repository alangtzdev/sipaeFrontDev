/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EvaluacionIdiomaParteTresComponent } from './evaluacion-idioma-parte-tres.component';

describe('EvaluacionIdiomaParteTresComponent', () => {
  let component: EvaluacionIdiomaParteTresComponent;
  let fixture: ComponentFixture<EvaluacionIdiomaParteTresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionIdiomaParteTresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionIdiomaParteTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
