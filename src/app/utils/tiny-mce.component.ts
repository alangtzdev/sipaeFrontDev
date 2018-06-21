import {Component, OnInit} from '@angular/core';

declare var tinymce: any;

@Component({
    selector: 'tiny-mce-editor',
    template: '<textarea class="tinyMCE" style="height:300px" [(ngModel)]="textoEditor"></textarea>'
})

export class TinyMCEComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
        let thisEditorComponent = this;
        tinymce.init(
            {
                selector: '.tinyMCE',
                language: 'es_MX',
                skin_url: 'assets/skins/lightgray',
                language_url: 'assets/js/tinymce/langs/es_MX.js',
                plugins: ['table preview print'],
                menubar: false,
                toolbar1: 'bold italic underline strikethrough alignleft aligncenter' +
                          'alignright alignjustify styleselect bullist numlist outdent' +
                          'indent blockquote undo redo removeformat subscript superscript table ' +
                          '| preview print',
                /* TODO 08/02/2017 
                '| code | savePDF',  Se elimina el boton de savePDF, ya que no tiene funcinalidad */
               /* setup: (editor): void => {
                    editor.addButton('savePDF', {
                        tooltip: 'Guardar en PDF',
                        icon: 'pdf',
                        onclick: function(): void {
                            thisEditorComponent.pruebaBoton(editor);
                        }
                    });
                }*/
            });
    }

    pruebaBoton(editor: string): void {
        console.log('Funcion custom');
    }
}
