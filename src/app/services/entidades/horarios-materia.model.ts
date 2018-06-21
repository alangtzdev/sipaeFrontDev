
export class HorariosMateria {
    public id: number;
    public lunesInicio: string;
    public lunesFin: string;
    public martesInicio: string;
    public martesFin: string;
    public miercolesInicio: string;
    public miercolesFin: string;
    public juevesInicio: string;
    public juevesFin: string;
    public viernesInicio: string;
    public viernesFin: string;
    public sabadoInicio: string;
    public sabadoFin: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.lunesInicio = json.lunes_inicio;
            this.lunesFin = json.lunes_fin;
            this.martesInicio = json.martes_inicio;
            this.martesFin = json.martes_fin;
            this.miercolesInicio = json.miercoles_inicio;
            this.miercolesFin = json.miercoles_fin;
            this.juevesInicio = json.jueves_inicio;
            this.juevesFin = json.jueves_fin;
            this.viernesInicio = json.viernes_inicio;
            this.viernesFin = json.viernes_fin;
            this.sabadoInicio = json.sabado_inicio;
            this.sabadoFin = json.sabado_fin;
        }
    }
}
