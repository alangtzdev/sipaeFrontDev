/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SolicitudCartaNoAdeudoComponent } from './solicitud-carta-no-adeudo.component';

describe('SolicitudCartaNoAdeudoComponent', () => {
  let component: SolicitudCartaNoAdeudoComponent;
  let fixture: ComponentFixture<SolicitudCartaNoAdeudoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudCartaNoAdeudoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudCartaNoAdeudoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
