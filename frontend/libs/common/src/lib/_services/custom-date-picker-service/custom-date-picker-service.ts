import { Injectable } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CustomDatepickerIntlService extends MatDatepickerIntl {
  constructor(private translate: TranslateService) {
    super();

    this.setTranslations();

    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  private setTranslations(): void {
    this.prevMonthLabel = this.translate.instant('general.button.prevMonthLabel');
    this.nextMonthLabel = this.translate.instant('general.button.nextMonthLabel');
    this.prevYearLabel = this.translate.instant('general.button.prevYearLabel');
    this.nextYearLabel = this.translate.instant('general.button.nextYearLabel');
    this.nextMultiYearLabel = this.translate.instant('general.button.nextMultiYearLabel');
    this.prevMultiYearLabel = this.translate.instant('general.button.prevMultiYearLabel'); 
    this.changes.next();
  }
}
