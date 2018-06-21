/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TrabajoRecuperacionRecursosComponent } from './trabajo-recuperacion-recursos.component';

describe('TrabajoRecuperacionRecursosComponent', () => {
  let component: TrabajoRecuperacionRecursosComponent;
  let fixture: ComponentFixture<TrabajoRecuperacionRecursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrabajoRecuperacionRecursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrabajoRecuperacionRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
