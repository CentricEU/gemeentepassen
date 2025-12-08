import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_TOASTER = new HttpContextToken<boolean>(() => false);
