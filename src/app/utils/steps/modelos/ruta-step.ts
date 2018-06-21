import {Router} from "@angular/router";
/**
 * RutaStep es una modelo para declarar y validar las rutas de navegacion
 * dentro de la navegacion de una estructura Steps, este componente debe
 * ser utilizado unicamente para la declaracion de una estructura Step
 */
export class RutaStep {

    /**
     * El costructor evalua que los parametros enviados, puedan navegar a una
     * ruta valida declarada en el RouterConfig de la clase principal del Step
     * @param ruta  Recibe el nombre (´name´) declarado en el `RouterConfig`.
     * @param router  Recibe el ´router´ declarado en la clase principal Step.
     * @returns       Regresa una instancia de la clase.
     */
    constructor(private _ruta: string, private _router: Router) {
        this._router.createUrlTree([this._ruta]);  //.generate([this._ruta]);
    }

    /**
     * @returns Regresa el nombre (´name´) declarado en el `RouterConfig`.
     */
    obtenerNombre(): string {
        return this._ruta;
    }

    /**
     * @returns Navega a la ruta configurada con el nombre en el constructor.
     */
    navegar(): Promise<any> {
        return this._router.navigate([this._ruta]);
    }
}
