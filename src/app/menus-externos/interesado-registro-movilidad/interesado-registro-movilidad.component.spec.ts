/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InteresadoRegistroMovilidadComponent } from './interesado-registro-movilidad.component';

describe('InteresadoRegistroMovilidadComponent', () => {
  let component: InteresadoRegistroMovilidadComponent;
  let fixture: ComponentFixture<InteresadoRegistroMovilidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteresadoRegistroMovilidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteresadoRegistroMovilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
