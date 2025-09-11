// services/apis/interceptor.ts
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function Interceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log('Request made with ', req);
  const cloned = req.clone({ withCredentials: true });
  console.log('Request made with ', cloned);
  return next(cloned);
}
