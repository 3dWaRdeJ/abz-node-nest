import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
  Req,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import {PositionService} from "./position.service";
import {PositionEntity} from "./position.entity";
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import * as PositionDto from './position.dto';
import {AuthGuard} from "@nestjs/passport";

@ApiBearerAuth()
@ApiTags('Position')
@Controller('api/v1/position')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({status: 403, description: 'Forbidden'})
export class PositionController {
  constructor(
    private readonly positionService: PositionService
  ) {}

  @Get()
  @ApiResponse({status: 200, description: 'Result records'})
  async getPositions(
    @Query('skip', new ValidationPipe({transform: true})) skip: number,
    @Query('take', new ValidationPipe({transform: true})) take: number,
    @Req() req
  ): Promise<PositionEntity[]> {
    return this.positionService.find(take, skip);
  }

  @Post()
  @ApiResponse({status: 200, description: 'Position created'})
  async createPosition(
    @Body() createDto: PositionDto.CreateDto,
    @Req() req
  ): Promise<PositionEntity> {
    const position = Object.assign(new PositionEntity(), createDto, {adminCreateId: req.user.id, adminUpdateId: req.user.id});
    return this.positionService.save(position);
  }

  @Patch(':id')
  @ApiResponse({status:200, description: 'Update position'})
  async patchPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: PositionDto.CreateDto,
    @Req() req
  ): Promise<PositionEntity> {
    let position = await this.positionService.findById(id);
    position = Object.assign(position, updateDto, {adminUpdateId: req.user.id});
    return this.positionService.save(position);
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Get record by id'})
  async getPosition(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PositionEntity> {
    return this.positionService.findById(id);
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Delete record by id'})
  async deletePosition(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.remove(id);
  }
}
