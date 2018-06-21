/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TemariosParticularesComponent } from './temarios-particulares.component';

describe('TemariosParticularesComponent', () => {
  let component: TemariosParticularesComponent;
  let fixture: ComponentFixture<TemariosParticularesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemariosParticularesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemariosParticularesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
