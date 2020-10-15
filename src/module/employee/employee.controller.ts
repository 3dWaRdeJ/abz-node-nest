import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe, Patch,
  Post,
  Query, Req,
  UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {EmployeeService} from "./employee.service";
import {EmployeeEntity} from "./employee.entity";
import * as EmployeeDto from './employee.dto';
import {FilesInterceptor} from "@nestjs/platform-express";

@ApiBearerAuth()
@ApiTags('Employee')
@Controller('api/v1/employee')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({status: 403, description: 'Forbidden'})
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService
  ) {}

  @Get()
  @ApiResponse({status:200, description: 'Result employee records'})
  async getEmployees(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
  ): Promise<EmployeeEntity[]> {
    return this.employeeService.find({take:take, skip:skip});
  }

  @Post()
  @ApiResponse({status: 200, description: 'Create employee record'})
  async createEmployee(
    @Body() createDto: EmployeeDto.CreateDto,
    @Req() req
  ): Promise<EmployeeEntity> {
    //correct merge req data with entity
    const employee = Object.assign(
      new EmployeeEntity(),
      createDto,
      {
        id: undefined, created_at: undefined, updated_at: undefined,
        admin_create_id: req.user.id, admin_update_id: req.user.id
      })
    return await this.employeeService.createWithValidation(employee);
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Get employee by id'})
  async getEmployee(
    @Param('id', ParseIntPipe) id: number
  ): Promise<EmployeeEntity> {
    return this.employeeService.checkIfExist(id);
  }

  @Patch(':id')
  @ApiResponse({status: 200, description: 'Update employee record'})
  async patchEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: EmployeeDto.CreateDto,
    @Req() req
  ): Promise<EmployeeEntity> {
    let employee = await this.employeeService.checkIfExist(id, {relations: ['subEmployees']});

    //correct merge req data with entity
    const oldPositionId = employee.position_id;
    employee = Object.assign(employee, updateDto, {
      id: id, admin_update_id: req.user.id, photo_path: employee.photo_path
    });
    delete employee.admin_create_id;
    delete employee.created_at;
    delete employee.updated_at;

    employee = await this.employeeService.updateWithValidation(employee, oldPositionId);
    return employee;
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Delete employee by id'})
  async deleteEmployee(
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    await this.employeeService.checkIfExist(id);
    return this.employeeService.remove(id);
  }
}
