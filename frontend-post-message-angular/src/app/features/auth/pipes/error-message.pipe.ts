import { Pipe, PipeTransform } from '@angular/core';
import { AUTH_ERROR_MAP, AUTH_MESSAGES } from '../constants';

@Pipe({
  name: 'errorMessage',
  standalone: true
})
export class ErrorMessagePipe implements PipeTransform {
  transform(errorCode: string | null): string {
    if (!errorCode) return '';
    return AUTH_ERROR_MAP[errorCode] || AUTH_MESSAGES.NETWORK_ERROR;
  }
}
