/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DetalleInvestigadorAnfitrionComponent } from './detalle-investigador-anfitrion.component';

describe('DetalleInvestigadorAnfitrionComponent', () => {
  let component: DetalleInvestigadorAnfitrionComponent;
  let fixture: ComponentFixture<DetalleInvestigadorAnfitrionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleInvestigadorAnfitrionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleInvestigadorAnfitrionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
