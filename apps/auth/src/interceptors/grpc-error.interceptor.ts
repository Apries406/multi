import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, of } from 'rxjs';

@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const originError = error.getError();
        const errorResponse = {
          code: originError.code || 'UNKNOWN_CODE',
          message: originError.message || 'Unknown Error Occurred!!! ',
          details: originError.details || {},
        };

        return of({ error: errorResponse });
      }),
    );
  }
}
