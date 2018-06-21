/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InduccionTicsComponent } from './induccion-tics.component';

describe('InduccionTicsComponent', () => {
  let component: InduccionTicsComponent;
  let fixture: ComponentFixture<InduccionTicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InduccionTicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InduccionTicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
