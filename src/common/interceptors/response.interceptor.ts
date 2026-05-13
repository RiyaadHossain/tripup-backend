import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    // const request = _context.switchToHttp().getRequest();
    // const message = request?.message || 'Request successful';
    // const data = request?.data || null;
    // const meta = request?.meta || null;

    return next.handle().pipe(
      map((data) => {
        const message = data?.message || 'Request successful';
        const responseData = data?.data || data;
        const meta = data?.meta || null;

        return {
          success: true,
          message,
          data: responseData,
          meta,
        };
      }),
    );
  }
}
