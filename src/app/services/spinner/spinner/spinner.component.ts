import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {SpinnerService, SpinnerEvent} from './spinner.service';

@Component({
  selector: 'app-spinner-overflow',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnDestroy, OnInit {
  state = {
    message: 'Por favor espere...'
  };
  id: string;
  loading: boolean = false;
  subscribers: Array<Subscription> = [];
  constructor(private spinnerService: SpinnerService) {
  }

  ngOnInit() {
    this.subscribers.push(
      this.spinnerService
        .subscribe((data) => {
          if (!!data && data.operation === SpinnerEvent.OPEN) {
            this.open(data.id);
          } else if (data &&
            (
              (data.operation === SpinnerEvent.CLOSE ||
              data.operation === SpinnerEvent.DESTROY)
              &&
                data.id === this.id
            )
          ) {
            this.close();
          }
      })
    );
  }

  ngOnDestroy() {
    if (this.subscribers) {
      this.subscribers.forEach(item => item.unsubscribe());
      this.subscribers = null;
    }
  }


  private open(id:string) {
    this.id = id;
    this.loading = true;
  }

  private close() {
    this.loading = false;
  }

}
