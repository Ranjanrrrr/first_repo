import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // 🛑 Skip attaching token to these URLs
  const skipAuthUrls = ['/api/token/', '/api/register/'];
  const shouldSkip = skipAuthUrls.some(url => req.url.includes(url));

  if (!shouldSkip && token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
