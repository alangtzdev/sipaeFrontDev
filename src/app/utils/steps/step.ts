import {EstadoStep} from './modelos/estado-step';
import {TipoStep} from './modelos/tipo-step';
import {RutaStep} from './modelos/ruta-step';

export class Step {
    orden: number;
    titulo: string;
    descripcion: string;
    estado: string;
    tipo: string;
    ruta: RutaStep;
    errorNext: string;
    errorFinish: string;
    errorPrevius: string;

    constructor(
        orden: number, titulo: string, tipo: string,
        estado: string, ruta: RutaStep, descripcion?: string) {
        this.validarEnumeradoTipoStep(tipo);
        this.validarEnumeradoEstadoStep(estado);

        this.orden = orden;
        this.titulo = titulo;
        this.estado = estado;
        this.tipo = tipo;
        this.descripcion = descripcion ? descripcion : '';
        this.ruta = ruta;
    }

    nextMethod(): boolean {
        this.errorNext = 'Se debe sobreescribir la funcion nextMethod(): boolean ' +
            'en el componente ' + this.ruta.obtenerNombre() + ' de la posicion ' + this.orden;
        return false;
    }

    finishMethod(): boolean {
        this.errorFinish = 'Se debe sobreescribir la funcion finishMethod(): boolean ' +
            'en el componente ' + this.ruta.obtenerNombre() + ' de la posicion ' + this.orden;
        return false;
    }
    
    getForm(): any {
        this.errorPrevius = 'Se debe sobreescribir la funcion previusMethod(): boolean ' +
            'en el componente ' + this.ruta.obtenerNombre() + ' de la posicion ' + this.orden;
        return false;
    }
    previusMethod(): boolean {
        this.errorPrevius = 'Se debe sobreescribir la funcion previusMethod(): boolean ' +
            'en el componente ' + this.ruta.obtenerNombre() + ' de la posicion ' + this.orden;
        return false;
    }

    private validarEnumeradoTipoStep(tipo: string): void {
        switch (tipo) {
            case TipoStep.FIRST:
            case TipoStep.STEP:
            case TipoStep.FINAL:
                break;
            default:
                throw 'El Tipo del step debe ser un enumerado "tipo-step.ts"';
        }
    }

    private validarEnumeradoEstadoStep(estado: string): void {
        switch (estado) {
            case EstadoStep.ACTIVO:
            case EstadoStep.INACTIVO:
            case EstadoStep.COMPLETO:
                break;
            default:
                throw 'El Estado del step debe ser un enumerado "estado-step.ts"';
        }
    }
}
