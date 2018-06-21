/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DefensaTesisComponent } from './defensa-tesis.component';

describe('DefensaTesisComponent', () => {
  let component: DefensaTesisComponent;
  let fixture: ComponentFixture<DefensaTesisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefensaTesisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefensaTesisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
