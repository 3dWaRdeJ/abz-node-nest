import {ResourceOptions, ValidationError, BaseRecord, BaseResource, PropertyErrors} from "admin-bro";
import {PositionEntity} from "../../../position/position.entity";
import {getRepository} from "typeorm";
import {LocaleTranslationsBlock} from "admin-bro/src/locale/config";
import {EmployeeLocaleResource} from "../employee/employee.resource";
import {RecordError} from "admin-bro/types/src/backend/utils/validation-error";

const positionLevelValues = [];
for(let i = PositionEntity.MAX_LEVEL; i > 0 ; i--) {
  positionLevelValues.push({value: i, label: i});
}

function checkRequiredProps(position) {
  const propErrors: PropertyErrors = {};
  const reqPops = ['name'];
  for (const propName of reqPops) {
    if (position[propName] === undefined || position[propName].trim() === '') {
      propErrors[propName] = {message: `${EmployeeLocaleResource.EmployeeEntity.properties[propName] ?? propName} is required`}
    }
  }

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, {message: 'You have blank required fields'});
  }
  return true;
}

function checkName(name: string, errors: PropertyErrors): boolean {

  if (name.length < 3 ) {
    errors.name = {message: 'Position name must have at least 3 characters'}
    return false
  }
  //simple name validation ()
  const nameRegexp = /^[\w\dа-яА-яъёЁьыїЇґҐ_-]{3,255}$/;

  if (nameRegexp.test(name) == false) {
    errors.name = {message: 'Position wrong characters for name, allow only alphanumeric characters(latin and cyrillic) and _,-'}
    return false;
  }


  if (name.length > 255 || name.length < 3) {
    errors.name = {message: 'Position name must have no more then 255 characters'}
    return false;
  }

  return true;
}

function validateChiefPosition(chiefPosition: PositionEntity) {
  if (chiefPosition.level > 2) {
    return false;
  }
  return true;
}

async function validatePosition(newPosition: PositionEntity): Promise<boolean> {
  const propErrors: PropertyErrors = {};
  const baseError: RecordError = {message: 'Validation failed'};
  checkName(newPosition.name, propErrors);

  const positionRep = getRepository(PositionEntity);

  const chiefPos = await positionRep.findOne(newPosition.chief_position_id);
  if (chiefPos) {
    if (validateChiefPosition(chiefPos)) {
        propErrors.chief_position_id = {message: 'Wrong chief position, chief position level must be at least 2'}
    }
    newPosition.level = chiefPos.level - 1;
  }

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, baseError);
  }

  return true;
}

export const PositionResource: ResourceOptions = {
  //@ts-ignore
  resource: PositionEntity,
  options: {
    properties: {
      id: {position: 0,},
      name: {position:1, isTitle: true, isRequired: true},
      level: {
        position:2,
        type: 'integer',
        availableValues: positionLevelValues,
        isRequired: false
      },
      chief_position_id: {position:3, type: 'reference', isRequired: false},
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
        before: async (request, { currentAdmin }) => {
          checkRequiredProps(request.payload);
          await validatePosition(request.payload)
          request.payload = {
            ...request.payload,
            created_at: undefined,
            updated_at: undefined,
            admin_create_id: currentAdmin.id,
            admin_update_id: currentAdmin.id,
          }
          return request
        }
      },
      edit: {
        before: async (request, {currentAdmin, record }) => {
          if (request.method == 'post') {
            checkRequiredProps(request.payload);
            await validatePosition(request.payload);

            //delete reference value of chief position for sub positions
            if (record.chief_position_id !== request.payload.chief_position_id) {
              const positionRep = getRepository(PositionEntity);
              //delete relation with subPositions
              await positionRep.createQueryBuilder()
                .update()
                .set({chief_position_id: null})
                .where("chief_position_id = :id", {id: record.id})
                .execute();
            }
            request.payload = {
              ...request.payload,
              created_at: undefined,
              updated_at: undefined,
              admin_update_id: currentAdmin.id,
            }
          }
          return request
        }
      }
    }
  }
}

export const PositionLocaleResource: {
  [key: string]: Partial<LocaleTranslationsBlock>;
} = {
  PositionEntity: {
    properties: {
      id: 'ID',
      chief_position_id: 'Chief position',
      admin_create_id: 'Admin created',
      admin_update_id: 'Admin updated',
      created_at: 'Created at',
      updated_at: 'Updated at'
    }
  },
}
