import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        if (resObj.message !== undefined) {
          message = resObj.message;
        } else if (resObj.error !== undefined) {
          message = resObj.error;
        } else {
          message = exception.message || 'Internal Server Error';
        }
      } else if (typeof res === 'string') {
        message = res;
      } else {
        message = exception.message || 'Internal Server Error';
      }
    } else {
      console.error('Unhandled Exception: ', exception);
      if (exception instanceof Error && exception.message) {
        message = exception.message;
      }
    }

    response.status(status).json({
      success: false,
      message,
    });
  }
}

