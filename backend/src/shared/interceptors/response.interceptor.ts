import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    total: number;
    limit: number;
  };
}

export interface PaginatedData<T> {
  data: T;
  meta: {
    page: number;
    total: number;
    limit: number;
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        if (
          responseData !== null &&
          typeof responseData === 'object' &&
          'data' in responseData &&
          'meta' in responseData
        ) {
          const paginated = responseData as unknown as PaginatedData<T>;
          return {
            success: true as const,
            data: paginated.data,
            meta: paginated.meta,
          };
        }
        return {
          success: true as const,
          data: responseData,
        };
      }),
    );
  }
}
