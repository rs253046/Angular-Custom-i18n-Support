import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { I18nDirective } from './directives/i18n.directive';
import { I18nService } from "./services/i18n/i18n.service";
import { OfflineManagerService } from "./services/offline-manager/offline-manager.service";
import { AutosaveDirective } from './directives/autosave/autosave.directive';

@NgModule({
  declarations: [
    AppComponent,
    I18nDirective,
    AutosaveDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    I18nService,
    OfflineManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private i18n: I18nService) {
    i18n.setDefaultLang('en');
  }
}
