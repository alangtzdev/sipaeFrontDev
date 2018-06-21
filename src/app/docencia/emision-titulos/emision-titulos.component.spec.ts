/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmisionTitulosComponent } from './emision-titulos.component';

describe('EmisionTitulosComponent', () => {
  let component: EmisionTitulosComponent;
  let fixture: ComponentFixture<EmisionTitulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmisionTitulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmisionTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
