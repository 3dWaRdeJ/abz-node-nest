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
  ValidationPipe,
  DefaultValuePipe, BadRequestException
} from '@nestjs/common';
import {PositionService} from "./position.service";
import {PositionEntity} from "./position.entity";
import {ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
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
  @ApiQuery({name: 'skip', schema: {required: ['false']}})
  async getPositions(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
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
    position.chiefPosition = createDto.chief_position_id
      ? await this.positionService.checkIfExist(createDto.chief_position_id)
      : null;

    return this.positionService.createWithValidation(position);
  }

  @Patch(':id')
  @ApiResponse({status:200, description: 'Update position'})
  async patchPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: PositionDto.CreateDto,
    @Req() req
  ): Promise<PositionEntity> {
    let position = await this.positionService.checkIfExist(id, {relations: ['subPositions']});
    const oldChiefPosId = position.chief_position_id;
    position = Object.assign(position, updateDto, {admin_update_id: req.user.id});
    position = await this.positionService.updateWithValidation(position, oldChiefPosId);
    delete position.subPositions;
    delete position.chiefPosition;
    return position;
  }

  @Get(':id')
  @ApiResponse({status: 200, description: 'Get record by id'})
  async getPosition(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PositionEntity> {
    return this.positionService.checkIfExist(id);
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: 'Delete record by id'})
  async deletePosition(@Param('id', ParseIntPipe) id: number) {
    await this.positionService.checkIfExist(id);
    return this.positionService.remove(id);
  }
}
