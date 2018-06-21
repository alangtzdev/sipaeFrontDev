/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiberarAdeudosDocenciaComponent } from './liberar-adeudos-docencia.component';

describe('LiberarAdeudosDocenciaComponent', () => {
  let component: LiberarAdeudosDocenciaComponent;
  let fixture: ComponentFixture<LiberarAdeudosDocenciaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiberarAdeudosDocenciaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiberarAdeudosDocenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
