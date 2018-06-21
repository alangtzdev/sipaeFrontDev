/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MovilidadInterprogramasComponent } from './movilidad-interprogramas.component';

describe('MovilidadInterprogramasComponent', () => {
  let component: MovilidadInterprogramasComponent;
  let fixture: ComponentFixture<MovilidadInterprogramasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovilidadInterprogramasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovilidadInterprogramasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
