/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiberarAdeudosRmsComponent } from './liberar-adeudos-rms.component';

describe('LiberarAdeudosRmsComponent', () => {
  let component: LiberarAdeudosRmsComponent;
  let fixture: ComponentFixture<LiberarAdeudosRmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiberarAdeudosRmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiberarAdeudosRmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
