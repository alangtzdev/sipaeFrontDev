/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OptativasComponent } from './optativas.component';

describe('OptativasComponent', () => {
  let component: OptativasComponent;
  let fixture: ComponentFixture<OptativasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptativasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
