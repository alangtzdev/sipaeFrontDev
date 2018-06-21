/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiberarAdeudosUticComponent } from './liberar-adeudos-utic.component';

describe('LiberarAdeudosUticComponent', () => {
  let component: LiberarAdeudosUticComponent;
  let fixture: ComponentFixture<LiberarAdeudosUticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiberarAdeudosUticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiberarAdeudosUticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
