/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SolicitudesInterprogramasCoordinacionComponent } from './solicitudes-interprogramas-coordinacion.component';

describe('SolicitudesInterprogramasCoordinacionComponent', () => {
  let component: SolicitudesInterprogramasCoordinacionComponent;
  let fixture: ComponentFixture<SolicitudesInterprogramasCoordinacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudesInterprogramasCoordinacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesInterprogramasCoordinacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
