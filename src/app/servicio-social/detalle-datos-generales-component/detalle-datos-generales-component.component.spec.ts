/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DetalleDatosGeneralesComponentComponent } from './detalle-datos-generales-component.component';

describe('DetalleDatosGeneralesComponentComponent', () => {
  let component: DetalleDatosGeneralesComponentComponent;
  let fixture: ComponentFixture<DetalleDatosGeneralesComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleDatosGeneralesComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleDatosGeneralesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
