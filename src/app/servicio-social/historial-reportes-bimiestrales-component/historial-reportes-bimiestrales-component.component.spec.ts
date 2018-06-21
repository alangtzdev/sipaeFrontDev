/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HistorialReportesBimiestralesComponentComponent } from './historial-reportes-bimiestrales-component.component';

describe('HistorialReportesBimiestralesComponentComponent', () => {
  let component: HistorialReportesBimiestralesComponentComponent;
  let fixture: ComponentFixture<HistorialReportesBimiestralesComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorialReportesBimiestralesComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialReportesBimiestralesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
