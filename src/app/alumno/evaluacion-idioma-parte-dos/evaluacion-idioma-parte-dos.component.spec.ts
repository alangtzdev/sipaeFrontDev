/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EvaluacionIdiomaParteDosComponent } from './evaluacion-idioma-parte-dos.component';

describe('EvaluacionIdiomaParteDosComponent', () => {
  let component: EvaluacionIdiomaParteDosComponent;
  let fixture: ComponentFixture<EvaluacionIdiomaParteDosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionIdiomaParteDosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionIdiomaParteDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
