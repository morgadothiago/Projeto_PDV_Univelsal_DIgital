import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface HttpExceptionResponse {
  message?: string | string[];
  code?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let code: string;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getCodeFromStatus(status);
      } else {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        const rawMessage = responseObj.message ?? exception.message;
        message = Array.isArray(rawMessage) ? rawMessage.join('; ') : rawMessage;
        code = responseObj.code ?? this.getCodeFromStatus(status);
      }

      response.status(status).json({
        success: false,
        error: {
          message,
          code,
          statusCode: status,
        },
      });
    } else {
      const err = exception as Error;
      this.logger.error(
        `[500] ${request.method} ${request.url} — ${err?.message ?? 'Unknown error'}`,
        err?.stack,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: err?.message ?? 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      });
    }
  }

  private getCodeFromStatus(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] ?? 'INTERNAL_ERROR';
  }
}
