/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BecasApoyosComponent } from './becas-apoyos.component';

describe('BecasApoyosComponent', () => {
  let component: BecasApoyosComponent;
  let fixture: ComponentFixture<BecasApoyosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BecasApoyosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BecasApoyosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
