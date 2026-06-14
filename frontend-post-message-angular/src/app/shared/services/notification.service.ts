import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  success(title: string, message?: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#1a1a1a'
    });
  }

  error(title: string, message?: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc2626'
    });
  }

  warning(title: string, message?: string): void {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d97706'
    });
  }

  info(title: string, message?: string): void {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Ok',
      confirmButtonColor: '#1a1a1a'
    });
  }

  toast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const iconMap: Record<string, SweetAlertIcon> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: iconMap[type],
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toastEl) => {
        toastEl.addEventListener('mouseenter', Swal.stopTimer);
        toastEl.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }
}
