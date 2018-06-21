/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ComentariosAdicionalesIdiomasComponent } from './comentarios-adicionales-idiomas.component';

describe('ComentariosAdicionalesIdiomasComponent', () => {
  let component: ComentariosAdicionalesIdiomasComponent;
  let fixture: ComponentFixture<ComentariosAdicionalesIdiomasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComentariosAdicionalesIdiomasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComentariosAdicionalesIdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
