export class PlantillaEditor {
    public id: number;
    public path: string;
    public nombre: string;
    public isHtml: boolean;
    public htmlPlantilla: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.path = json.path;
            this.nombre = json.nombre;
            this.isHtml = json.is_html;
            this.htmlPlantilla = json.html_plantilla;
        }
    }
}
