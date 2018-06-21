/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SolicitudesInterprogramasProfesorComponent } from './solicitudes-interprogramas-profesor.component';

describe('SolicitudesInterprogramasProfesorComponent', () => {
  let component: SolicitudesInterprogramasProfesorComponent;
  let fixture: ComponentFixture<SolicitudesInterprogramasProfesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudesInterprogramasProfesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesInterprogramasProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
