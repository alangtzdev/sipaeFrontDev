/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CartaNoAdeudoListComponent } from './carta-no-adeudo-list.component';

describe('CartaNoAdeudoListComponent', () => {
  let component: CartaNoAdeudoListComponent;
  let fixture: ComponentFixture<CartaNoAdeudoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartaNoAdeudoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartaNoAdeudoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
