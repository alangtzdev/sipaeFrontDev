/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MovilidadesVigentesComponent } from './movilidades-vigentes.component';

describe('MovilidadesVigentesComponent', () => {
  let component: MovilidadesVigentesComponent;
  let fixture: ComponentFixture<MovilidadesVigentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovilidadesVigentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovilidadesVigentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
