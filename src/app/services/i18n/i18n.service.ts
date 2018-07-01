import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, operators } from 'rxjs';
import IntlMessageFormat from 'intl-messageformat';

declare const require;
const { mergeAll } = operators;

@Injectable()
export class I18nService {
  private currentLang: string;
  private defaultLang: string;
  private localeStore: object = {};
  public onTranslationChange: EventEmitter<object> = new EventEmitter<object>();
  public onDefaultLangChange: EventEmitter<string> = new EventEmitter<string>();
  public onLangChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _http: HttpClient) { }

  /*
    setDefaultLang method is use to set the default lang for the i18n service and update locale store.
    setDefaultLang('en') sets 'en' as the default lang.
  */

  public setDefaultLang(lang: string): void {
    this.defaultLang = lang;
    this.onDefaultLangChange.emit(this.defaultLang);
    this.updateLocales();
  }

  /*
    getDefaultLang() return the default lang used for i18n service.
  */

  public getDefaultLang(): string {
    return this.defaultLang;
  }

  /*
    use('en') method is used to update locales at runtime.
    It will update all reference of locales from i18n service.
  */

  public use(lang: string): void {
    this.currentLang = lang;
    this.onLangChange.emit(this.currentLang);
    this.updateLocales();
  }

  /*
    t('foo.bar', {foo: bar}) return the requested translation from the locale store.
    It uses formatJS to format the translation based on the interpolateParams.
    In case no translation found in the store it will return fallback string.
  */

  public t(localeString: string, interpolateParams?: object): string {
    const currentLang: string = this.getCurrentLang();
    const message: string = Object.keys(this.localeStore).length > 0 ?
      this.getLocaleMessage(localeString, currentLang) : '';
    return new IntlMessageFormat(message, currentLang).format(interpolateParams);
  }

  /*
    getTranslation('en') method return the complete locales object from the store for the request lang.
  */

  public getTranslation(lang: string): object {
    return this.localeStore[lang];
  }

  /*
    getLocaleMessage('foo.bar', 'en') method returns the raw translation from the locale store which is then formatted in t('foo.bar', {foo: bar}) method above.

    Note: This is a private method, not to be used in public.
  */

  private getLocaleMessage(localeString: string, currentLang: string): string {
    return this.getLocaleFromStore(localeString, currentLang) || this.manageLocaleFallback(localeString);
  }

  /*
    updateLocales() method updates the locale store based on the current lang. 
    If current lang is present in the store it will return that else 
    it will send the network request to server to fetch the requested lang.

    Note: This is a private method, not to be used in public.
  */

  private updateLocales(): void {
    const currentLang = this.getCurrentLang();
    if (!this.localeStore[currentLang]) {
      this.fetchLocales(currentLang).subscribe(((locale: object) => this.onUpdateLocales(locale)));
    } else {
      this.onTranslationChange.emit(this.localeStore);
    }
  }

  /*
    getLocaleFromStore('foo.bar', 'en') method returns the requested tranlation from the store
    based on the locale string.

    Note: This is a private method, not to be used in public.
  */

  private getLocaleFromStore(localeString: string, currentLang: string): string {
    return localeString.split('.').reduce((o: object, i: string) => o[i], this.localeStore[(currentLang)]);
  }

  /*
    onUpdateLocales({en: {}}) method is called from updateLocales() above and is used to update localeStore when the locales are fetch from the server.

    Note: This is a private method, not to be used in public.
  */

  private onUpdateLocales(locale: object): void {
    this.localeStore[this.getCurrentLang()] = locale;
    this.onTranslationChange.emit(this.localeStore);
  }

  /*
    manageLocaleFallback('foo.bar') method returns the fallback string when no locales are found in the store. 
    This method can be extended to support lang fallback as well.

    Note: This is a private method, not to be used in public.
  */

  private manageLocaleFallback(localeKey: string): string {
    return this.missingTranslation(localeKey);
  }

  /*
    missingTranslation('foo.bar') method returns the missing translation string. This method is called from the  
    manageLocaleFallback('foo.bar') method above.

    Note: This is a private method, not to be used in public.
  */

  private missingTranslation(localeKey: string): string {
    return `Missing Translation ${localeKey}`;
  }

  /*
    getCurrentLang() method returns the lang that will be used in the i18n service. 
    If current lang is set then it will be returned else default lang.

    Note: This is a private method, not to be used in public.
  */

  private getCurrentLang(): string {
    return this.currentLang || this.defaultLang;
  }

  /*
    fetchLocales method is used to fetch locales by language from the server.
    It uses the webpack require to fetch the list of all available locales and return them as an observable.

    Note: This is a private method, not to be used in public.
  */

  private fetchLocales(lang: string): Observable<object> {
    const i18nContext = require.context('../../../i18n', true, /^\.\/.*\.json$/);
    const selectedTranslations: string[] = i18nContext.keys().filter((file: string) => file.includes(lang));
    const translationRequest = selectedTranslations.map((file: string) => this._http.get('i18n/' + file));
    return Observable.of(...translationRequest).pipe(mergeAll());
  }
}

