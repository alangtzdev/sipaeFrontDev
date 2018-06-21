/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiberarAdeudosFinanzasComponent } from './liberar-adeudos-finanzas.component';

describe('LiberarAdeudosFinanzasComponent', () => {
  let component: LiberarAdeudosFinanzasComponent;
  let fixture: ComponentFixture<LiberarAdeudosFinanzasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiberarAdeudosFinanzasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiberarAdeudosFinanzasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
