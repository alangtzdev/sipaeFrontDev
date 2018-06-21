export class DatoAcademicoMovilidadExterna {
    public id: number;
    public programaAcademico: string;
    public institucion: string;
    public facultad: string;
    public totalSemestre: number;
    public semestre: number;
    public promedioGeneral: number;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.programaAcademico = json.programa_academico;
            this.institucion = json.institucion;
            this.facultad = json.facultad;
            this.totalSemestre = json.total_semestre;
            this.semestre = json.semestre;
            this.promedioGeneral = json.promedio_general;
        }
    }
}