export class PaginacionInfo {
  constructor(
    public registrosTotales: number,
    public paginas: number,
    public paginaActual: number,
    public registrosPagina: number) { }
}
