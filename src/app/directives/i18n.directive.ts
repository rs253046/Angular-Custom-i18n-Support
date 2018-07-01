import { Directive, Input, OnChanges, SimpleChanges, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

@Directive({
  selector: '[appI18n]'
})
export class I18nDirective implements OnChanges, OnInit, OnDestroy {
  @Input() params: object;
  @Input() language: string;
  private localeKey: string;

  constructor(private el: ElementRef, private i18n: I18nService) { }

  ngOnInit(): void {
    this.localeKey = this.el.nativeElement.innerText;
    this.updateContent();
    this.registerLocaleEvents();
  }

  registerLocaleEvents(): void {
    this.i18n.onTranslationChange.subscribe(() => this.updateContent());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.params.firstChange) {
      this.updateContent();
    }
  }

  ngOnDestroy(): void {
    this.i18n.onTranslationChange.unsubscribe();
  }

  updateContent(): void {
    this.el.nativeElement.innerText = this.i18n.t(this.localeKey, this.params);
  }
}
