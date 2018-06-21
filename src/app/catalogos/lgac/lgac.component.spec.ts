/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LgacComponent } from './lgac.component';

describe('LgacComponent', () => {
  let component: LgacComponent;
  let fixture: ComponentFixture<LgacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LgacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LgacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
