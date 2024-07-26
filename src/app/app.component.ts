import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TaskManagement';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    this.translate.use('en')
  }
}
