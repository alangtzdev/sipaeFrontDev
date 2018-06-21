/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProfesorStepsDatosAcademicosComponent } from './profesor-steps-datos-academicos.component';

describe('ProfesorStepsDatosAcademicosComponent', () => {
  let component: ProfesorStepsDatosAcademicosComponent;
  let fixture: ComponentFixture<ProfesorStepsDatosAcademicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfesorStepsDatosAcademicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfesorStepsDatosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
