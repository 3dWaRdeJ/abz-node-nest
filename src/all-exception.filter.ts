import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let respData = null;
    respData = {
      statusCode: status,
      message: 'Unknown error',
      path: request.url,
    };
    if (exception instanceof HttpException) {
      respData = exception.getResponse();
    } else if (exception['code'] === 'EBADCSRFTOKEN') {
      respData.statusCode = exception['status'];
      status = exception['status'];
      respData.message = exception['message'];
    }

    if (/^\/api\/v1.*$/.test(request.url) === false) { //render error page
      const errorData = {status: status, titleMessage: exception['message']}
      switch (status) {
        case 401:
          errorData['link'] = '/login';
          errorData['linkName'] = 'Login';
          break;
        case 500:
          errorData['titleMessage'] = 'Unknown server error';
          break;
        default:
          errorData['titleMessage'] = respData.message ?? 'Unknown error';
      }
      response.render('error', errorData);
    } else {
      response.status(status).json(respData);
    }
  }
}