/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListaSolicitudesMovilidadExternaComponent } from './lista-solicitudes-movilidad-externa.component';

describe('ListaSolicitudesMovilidadExternaComponent', () => {
  let component: ListaSolicitudesMovilidadExternaComponent;
  let fixture: ComponentFixture<ListaSolicitudesMovilidadExternaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaSolicitudesMovilidadExternaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaSolicitudesMovilidadExternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
