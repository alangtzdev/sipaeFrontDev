import {EventEmitter, Injectable} from "@angular/core";
export enum SpinnerEvent {
  OPEN, DESTROY, CLOSE
}

@Injectable()
export class SpinnerService {

  private currentPopupView: EventEmitter<any> = new EventEmitter<any>();
  private _isOpened: boolean = false;

  start(id: string): void{
    if (this._isOpened) {
      this.destroy(id);
    }
    this.fireEvent(SpinnerEvent.OPEN, true, id);
  }

  destroy(id: string) {
    this.fireEvent(SpinnerEvent.DESTROY, false, id);
  }


  stop(id: string): void {
    this.fireEvent(SpinnerEvent.CLOSE, false, id);
  }

  subscribe(generatorOrNext?: any, error?: any, complete?: any){
    return this.currentPopupView.subscribe(generatorOrNext, error, complete);
  }

  private fireEvent(name: SpinnerEvent, status: boolean, id: string) {
    let _current = this._isOpened;
    this._isOpened = status;
    let event = {
      id: id,
      operation: name,
      status: {
        current: this._isOpened,
        old: _current
      },
    };
    this.currentPopupView.emit(event);
  }

}
