/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DictamenDefensaTesisComponent } from './dictamen-defensa-tesis.component';

describe('DictamenDefensaTesisComponent', () => {
  let component: DictamenDefensaTesisComponent;
  let fixture: ComponentFixture<DictamenDefensaTesisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DictamenDefensaTesisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictamenDefensaTesisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
