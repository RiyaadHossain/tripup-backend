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
        if (
          data !== null &&
          typeof data === 'object' &&
          data.success === true &&
          'data' in data
        ) {
          const res: Record<string, any> = {
            success: true,
            data: data.data !== null && data.data !== undefined ? data.data : [],
          };
          if ('message' in data && data.message !== undefined) {
            res.message = data.message;
          }
          if ('meta' in data && data.meta !== undefined) {
            res.meta = data.meta;
          }
          return res;
        }

        const message = data?.message || 'Request successful';
        const responseData = data?.data !== undefined ? data.data : data;
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
