/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NabComponent } from './nab.component';

describe('NabComponent', () => {
  let component: NabComponent;
  let fixture: ComponentFixture<NabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
