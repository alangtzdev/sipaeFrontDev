/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InteresadosListComponent } from './interesados-list.component';

describe('InteresadosListComponent', () => {
  let component: InteresadosListComponent;
  let fixture: ComponentFixture<InteresadosListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteresadosListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteresadosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
