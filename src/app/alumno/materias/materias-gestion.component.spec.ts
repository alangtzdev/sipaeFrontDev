import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {MateriasComponent} from "./materias-gestion.component";

describe('Pruebas para materias.ts ', () => {
  let keyIdAlumno = 'IdAlumno';

  beforeEach(() => [
    MateriasComponent
  ]);

  it('Prueba Obtener Carga Academica',
    inject([MateriasComponent], (materias) => {
      materias.getCargaAcademica(keyIdAlumno);
      expect(materias.cargaAcademica instanceof Array).toBeTruthy();
    })
  );

  it('Exportar interesados a formato PDF',
    inject([MateriasComponent], (materias) => {
      materias.exportarInteresadosPDF();
      expect(materias.errorGenerarPdf).toEqual(false);
    })
  );

  it('Exportar interesados a formato Excel',
    inject([MateriasComponent], (materias) => {
      materias.exportarInteresadosExcel();
      expect(materias.errorGenerarExcel).toEqual(false);
    })
  );
});
