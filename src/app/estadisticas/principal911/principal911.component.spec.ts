/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Principal911Component } from './principal911.component';

describe('Principal911Component', () => {
  let component: Principal911Component;
  let fixture: ComponentFixture<Principal911Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Principal911Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Principal911Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
