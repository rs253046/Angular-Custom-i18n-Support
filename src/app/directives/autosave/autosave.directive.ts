import { Directive, Input, OnInit, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { timer } from 'rxjs/observable/timer';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { OfflineManagerService } from '../../services/offline-manager/offline-manager.service';

@Directive({
  selector: '[appAutosave]'
})
export class AutosaveDirective implements OnInit, OnChanges {
  @Input() offline: boolean = true;
  @Input() limit: number = 1;
  @Input() delay: number = 1000; // seconds
  @Input() value: any;
  private _model: object;
  private restartAutosave = new Subject();

  constructor(
    private _http: HttpClient,
    private _offlineManager: OfflineManagerService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.subscribeAutosave();
  }

  subscribeAutosave(): void {
    this.autosave().subscribe(() => {
      this.updateContent();
    });
  }

  updateContent() {
    if (this._offlineManager.isOnline()) {
      this.sendNetworkRequest();
    } else {
      this.enqueueRequest();
    }
  }

  enqueueRequest(): void {
    const data = {
      method: 'POST',
      url: 'test',
      body: this._model
    };

    this._offlineManager.storeOfflineRequest(this.getIdentifier(), data);
  }

  getIdentifier(): string {
    return this.el.nativeElement.id || this.guid();
  }

  sendNetworkRequest(): void {
    this._http.post('dummy', this._model).subscribe(() => {
      console.log('asdfas', this.limit, this.delay);
    });
  }

  guid(): string {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  ngOnChanges(params: SimpleChanges): void {
    if (params.value.currentValue !== params.value.previousValue) {
      this._model = params.value.currentValue;
      this.restartAutosave.next(1);
    }
  }

  autosave(): Observable<number> {
    return this.restartAutosave.switchMap(() => timer(this.delay, this.delay).pipe(take(this.limit)));
  }
}
