import {ResourceOptions, ValidationError, BaseRecord, BaseResource} from "admin-bro";
import {PositionEntity} from "../../../position/position.entity";
import {getRepository} from "typeorm";

const positionLevelValues = [];
for(let i = PositionEntity.MAX_LEVEL; i > 0 ; i--) {
  positionLevelValues.push({value: i, label: i});
}


export const PositionResource: ResourceOptions = {
  //@ts-ignore
  resource: PositionEntity,
  options: {
    properties: {
      id: {position: 0},
      name: {position:1, isTitle: true, isRequired: true},
      level: {
        position:2,
        type: 'integer',
        availableValues: positionLevelValues,
        isRequired: false
      },
      chief_position_id: {position:3, isRequired: false},
      updated_at: {
        isVisible: {
          edit: false,
          show: true,
          list: true,
          filter: true,
        }
      },
      created_at: {
        isVisible: {
          edit: false,
          show: true,
          list: true,
          filter: true,
        }
      },
      admin_create_id: {
        isVisible: {
          edit: false,
          show: true,
          list: true,
          filter: true
        }
      },
      admin_update_id: {
        isVisible: {
          edit: false,
          show: true,
          list: true,
          filter: true
        }
      }
    },
    actions: {
      new: {
        before: async (request, { currentAdmin, resource }) => {
          const chiefPosRecord = request.payload.chief_position_id
            ? await resource.findOne(request.payload.chief_position_id)
            : null;
          if (chiefPosRecord) {
            if (PositionEntity.validateChiefPosition(chiefPosRecord)) {
              throw new ValidationError({
                chief_position_id: {message: 'Wrong chief position, chief position level must be at least 2'}
              });
            }
            request.payload.level = chiefPosRecord.level - 1;
          }
          request.payload = {
            ...request.payload,
            admin_create_id: currentAdmin.id,
            admin_update_id: currentAdmin.id,
          }
          return request
        }
      },
      edit: {
        before: async (request, {currentAdmin, record, resource}) => {
          if (record.params.chief_position_id !== request.payload.chief_position_id) {
            const positionRep = getRepository(PositionEntity);
            //delete relation with subPositions
            await positionRep.createQueryBuilder()
              .update()
              .set({chief_position_id: null})
              .where("chief_position_id = :id", {id: request.id})
              .execute();
          }
          const chiefPos = await resource.findOne(request.chief_position_id) ?? null;

          //validate chiefPosition level must be >= 2
          if (PositionEntity.validateChiefPosition(chiefPos.params)) {
            throw new ValidationError({
              chief_position_id: {message: 'Wrong chief position, chief position level must be at least 2'}
            });
          }
          request.payload.level = chiefPos.level - 1;
          request.payload = {
            ...request.payload,
            admin_update_id: currentAdmin.id,
          }
          return request
        }
      }
    }
  }
}
