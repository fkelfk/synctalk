import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpStatus,
  } from '@nestjs/common';
  import { QueryFailedError } from 'typeorm';
  
  @Catch(QueryFailedError)
  export class QueryFailedExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
  
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = `Query failed: ${exception.message}`;
  
      response.status(status).json({
        message: errorMessage,
        statusCode: status,
      });
    }
  }