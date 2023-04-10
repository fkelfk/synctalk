import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class QuerySpeedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(async () => {
        const end = Date.now();
        const time = end - start;
        const logger = new Logger();
        logger.debug(`Query executed in ${time}ms.`, `Database`);
      }),
    );
  }
}
