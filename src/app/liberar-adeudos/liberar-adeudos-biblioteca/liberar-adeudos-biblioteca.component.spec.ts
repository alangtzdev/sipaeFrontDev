/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LiberarAdeudosBibliotecaComponent } from './liberar-adeudos-biblioteca.component';

describe('LiberarAdeudosBibliotecaComponent', () => {
  let component: LiberarAdeudosBibliotecaComponent;
  let fixture: ComponentFixture<LiberarAdeudosBibliotecaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiberarAdeudosBibliotecaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiberarAdeudosBibliotecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
