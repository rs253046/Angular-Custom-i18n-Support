import { Component } from '@angular/core';
import { I18nService } from "./services/i18n/i18n.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  powers = ['Really Smart', 'Super Flexible', 'Super Hot', 'Weather Changer'];
  submitted = false;
  model = {
    name: 'Rahul Sungh',
    alterEgo: 'test',
    power: 'Super Flexible'
  }

  constructor(private i18n: I18nService) {
  }

  onSubmit() { this.submitted = true; }

  toggleLocale(lang) {
    this.i18n.use(lang);
  }
}
