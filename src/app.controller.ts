import {Controller, Get, Render, Req, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import {AuthGuard} from "@nestjs/passport";

@UseGuards(AuthGuard('jwt'))
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async indexPage(@Req() req) {
    // return {csrfToken: req.csrfToken()};
    return {};
  }

  @Get('/employee')
  @Render('employees')
  async employeesPage(@Req() req) {
    // return {csrfToken: req.csrfToken()};
    return {};
  }

  @Get('/position')
  @Render('positions')
  async positionsPage(@Req() req) {
    // return {csrfToken: req.csrfToken()};
    return {};
  }

}
