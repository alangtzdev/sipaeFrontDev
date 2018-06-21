/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EvaluacionIdiomaParteUnoComponent } from './evaluacion-idioma-parte-uno.component';

describe('EvaluacionIdiomaParteUnoComponent', () => {
  let component: EvaluacionIdiomaParteUnoComponent;
  let fixture: ComponentFixture<EvaluacionIdiomaParteUnoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionIdiomaParteUnoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionIdiomaParteUnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
