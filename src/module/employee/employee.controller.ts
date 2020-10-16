import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get, NotFoundException,
  Param,
  ParseIntPipe, Patch,
  Post,
  Query, Req, UploadedFiles,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiCookieAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {EmployeeService} from "./employee.service";
import {EmployeeEntity} from "./employee.entity";
import * as EmployeeDto from './employee.dto';
import {FilesInterceptor} from "@nestjs/platform-express";
import * as path from 'path';
import {MulterOptions} from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import * as multer from 'multer'
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import {EntityNotFoundError} from "typeorm/error/EntityNotFoundError";
import * as sizeOf from 'image-size';
import {ApiImplicitFile} from "@nestjs/swagger/dist/decorators/api-implicit-file.decorator";

//image format filter
const photoFilter = (req, file, callback) => {
  let isValid = true;
  let error = null;
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') {
    const message = 'Invalid file type, allow only image/png and image/jpg';
    req.fileValidationError = message;
    error = new BadRequestException(message);
    isValid = false;
  }
  return callback(error, isValid);
}

const publicDir = path.join(__dirname, '..', '..', '..', 'public');
//options for image
const fileOptions: MulterOptions = {
  fileFilter: photoFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  storage: multer.diskStorage({
    destination: path.resolve(path.join(publicDir, 'img')),
    filename: (req, file, callback) => {
      try {
        const filename: string = uuidv4();
        const ext: string = path.parse(file.originalname).ext;

        callback(null, `${filename}${ext}`);
      } catch (err) {
        callback(err, '');
      }
    }
  })
}

@ApiCookieAuth()
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

  @Post(':id/file')
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({name: 'photo', required: true, description: 'employee photo'})
  @ApiResponse({status: 200, description: 'upload employee photo'})
  @UseInterceptors(FilesInterceptor('photo', 1, fileOptions))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() photo,
  ): Promise<EmployeeEntity> {
    try {
      // @ts-ignore
      const dimension = sizeOf(photo[0].path);
      if (dimension.width < 300 || dimension.height < 300) {
        throw new BadRequestException(['photo wrong dimension, must be 300x300px']);
      }
      const employee = await this.employeeService.checkIfExist(id);
      employee.updatePhoto(publicDir, photo[0].filename);
      await this.employeeService.save(employee);
      return await this.employeeService.findById(id);
    } catch (err) {
      fs.unlinkSync(photo[0].path);
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException([`id employee with id=${id} not found`]);
      }
      throw err;
    }
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
