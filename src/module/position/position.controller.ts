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
  DefaultValuePipe
} from '@nestjs/common';
import {PositionService} from "./position.service";
import {PositionEntity} from "./position.entity";
import {ApiBearerAuth, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
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
    return this.positionService.find({take:take, skip:skip});
  }

  @Post()
  @ApiResponse({status: 200, description: 'Position created'})
  async createPosition(
    @Body() createDto: PositionDto.CreateDto,
    @Req() req
  ): Promise<PositionEntity> {
    //correct merge req data with entity
    const position = Object.assign(new PositionEntity(), createDto, {
      id: undefined, created_at: undefined, updated_at: undefined,
      admin_create_id: req.user.id, admin_update_id: req.user.id});

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

    //correct merge req data with entity
    const oldChiefPosId = position.chief_position_id;
    position = Object.assign(
      position,
      updateDto,
      {admin_create_id: position.admin_create_id, admin_update_id: req.user.id, id:position.id, created_at: undefined, updated_at:undefined}
    );
    position = await this.positionService.updateWithValidation(position, oldChiefPosId);
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
  async deletePosition(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.positionService.checkIfExist(id);
    return this.positionService.remove(id);
  }
}
