/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstitcionComponent } from './institcion.component';

describe('InstitcionComponent', () => {
  let component: InstitcionComponent;
  let fixture: ComponentFixture<InstitcionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstitcionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
