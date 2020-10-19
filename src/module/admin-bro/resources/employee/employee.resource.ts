import {PropertyErrors, ResourceOptions, ValidationError} from "admin-bro";
import {EmployeeEntity} from "../../../employee/employee.entity";
import uploadFileFeature from "@admin-bro/upload";
import * as path from "path";
import {LocaleTranslationsBlock} from "admin-bro/src/locale/config";
import * as fsExt from 'fs-extra';
import * as sizeOf from 'image-size';
import {getRepository} from "typeorm";
import {PositionEntity} from "../../../position/position.entity";
import {RecordError} from "admin-bro/types/src/backend/utils/validation-error";
import AdminBro from "admin-bro";

function checkName(name: string, errors: PropertyErrors): boolean {
  if (name.length < 3 ) {
    errors.full_name = {message: 'Employee name must have at least 3 characters'}
    return false
  }

  //simple name validation ()
  const nameRegexp = /^[\w\dа-яА-яъёЁьыїЇґҐ_-]{3,255}$/;

  if (nameRegexp.test(name) == false) {
    errors.name = {message: 'Used wrong characters for name, allow only alphanumeric characters(latin and cyrillic) and _,-'}
    return false;
  }

  if (name.length > 255 || name.length < 3) {
    errors.full_name = {message: 'Employee name must have no more then 255 characters'}
    return false;
  }
  return true;
}

function checkPhone(phone: string, errors: PropertyErrors):boolean {
  if (!/^[\+]{0,1}380(\d{9})$/.test(phone)) {
    errors.phone = {message: 'Wrong phone must be +380XXXXXXXXX'}
    return false;
  }
  return true;

}

function checkDate(date: string, errors: PropertyErrors): boolean {
  const timestamp = Date.parse(date);
  if (isNaN(timestamp)) {
    errors.start_date = {message: 'Date is invalid'}
    return false;
  }
  return true;
}
function checkEmail(email: string, errors: PropertyErrors):boolean {
  const rfc2822Email = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  if (!rfc2822Email.test(email)) {
    errors.email = {message: 'Invalid email'}
    return false;
  }
  return true;
}

function checkSalary(salary: number, errors: PropertyErrors):boolean {
  if (salary < 0 || salary > EmployeeEntity.MAX_SALARY) {
    errors.salary = {message: 'Wrong salary must be in range of 0 to ' + EmployeeEntity.MAX_SALARY}
    return false;
  }
  return true;
}

function checkPhoto(photo, errors: PropertyErrors):boolean {
  const dimension = sizeOf.imageSize(photo.path);
  if (dimension.width < 300 || dimension.height < 300) {
    errors.photo = {message: 'Wrong photo dimension must be at least 300x300px'}
    return false;
  }
  return true;
}

async function checkChief(newPositionId: number, chiefId: number, errors: PropertyErrors): Promise<boolean> {
  const positionRep = getRepository(PositionEntity);
  const newPosition = await positionRep.findOne(newPositionId, {relations: ['chiefPosition']});

  //if other admin delete position at this time
  if (!newPosition) {
    errors.position_id = {message: 'Wrong position, such position doesn\'t exist\nmaybe somebody else delete it'};
    return false;
  }

  if (chiefId) {
    const employeeRep = getRepository(EmployeeEntity);

    const newChief = await employeeRep.findOne(chiefId, {relations: ['position', 'position.subPositions']});

    //if other admin delete chief at this time
    if (!newChief) {
      errors.chief_id = {message: 'Wrong chief, such chief doesn\'t exist\nmaybe somebody else delete it'}
      return false;
    }

    if (newChief.position_id !== newPosition.id
      && newChief.position_id !== newPosition.chief_position_id
    ) {
      errors.chief_id = {
        message: `Wrong chief, for position '${newPosition.name}' as chief can be someone`
          + `with position '${newPosition.name}'`
      };
      if (newPosition.chiefPosition) {
        errors.chief_id.message += ` or '${newPosition.chiefPosition.name}'`;
      }
      errors.position_id = {message: `Wrong position for ${newChief.full_name}.\n`
          + `Possible position for this chief are: ${newChief.position.name}`
      };


      const possibleSubPos = [];
      for (const subPos of newChief.position.subPositions) {
        possibleSubPos.push(subPos.name);
      }
      if (possibleSubPos.length > 0) {
        possibleSubPos.unshift('');
        errors.position_id.message += possibleSubPos.join(', ');
      }
      return false;
    }

  }
  return true;
}

async function validateEmployee(request): Promise<boolean> {
  const propErrors: PropertyErrors = {};
  let baseError: RecordError = {message: 'Validation failed'};
  checkName(request.payload.full_name, propErrors);
  checkPhone(request.payload.phone, propErrors);
  checkEmail(request.payload.email, propErrors);
  checkSalary(request.payload.salary, propErrors);
  checkDate(request.payload.start_date, propErrors);
  await checkChief(request.payload.position_id, request.payload.chief_id, propErrors);
  if (request.files.photo) {
    if (checkPhoto(request.files.photo, propErrors) === false) {
      baseError = propErrors.photo;
    }
  }

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, baseError);
  }
  return true;
}

function checkRequiredProps(employee: EmployeeEntity) {
  const propErrors: PropertyErrors = {};
  const reqPops = ['full_name', 'salary', 'position_id', 'start_date', 'phone', 'email'];
  for (const propName of reqPops) {
    if (employee[propName] === undefined || employee[propName].trim() === '') {
      propErrors[propName] = {message: `${EmployeeLocaleResource.EmployeeEntity.properties[propName] ?? propName} is required`}
    }
  }

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, {message: 'You have blank required fields'});
  }
  return true;
}

export const EmployeeResource: ResourceOptions = {
  // @ts-ignore
  resource: EmployeeEntity,
  options: {
    properties: {
      id: {position:0},
      full_name: {
        position:1,
        type:'string',
        isTitle: true,
        isRequired: true,
        components: {
          list: AdminBro.bundle('./employee-photo.list.component.tsx'),
          show: AdminBro.bundle('./employee-photo.show.component.tsx')
        }
      },
      position_id: {position:2, type: 'reference', isRequired: true},
      start_date: {position:3, type: 'date', isRequired: true},
      phone: {position:4, typr: 'string', isRequired: true},
      email: {position:5, type:'string', isRequired: true},
      salary: {position:6, type: 'string', isRequired: true},
      chief_id: {position:7, type: 'reference', isRequired: false},
      photo_path: {
        type: 'string',
        isVisible: false
      },
      photo: {
        isVisible: {
          edit: true,
          show: false,
          list: false,
          filter: false,
        }
      },
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
          await validateEmployee(request);
          request.payload = {
            ...request.payload,
            created_at: undefined,
            updated_at: undefined,
            admin_create_id: currentAdmin.id,
            admin_update_id: currentAdmin.id,
          }
          if (request.files.photo) {
            request.payload.photo_path = request.files.photo.name;
          }

          return request
        }
      },
      edit: {
        before: async (request, {currentAdmin, record }) => {
          if (request.method === 'post') {
            checkRequiredProps(request.payload);
            await validateEmployee(request);

            if (request.files.photo) {
              request.payload.photo_path = path.join(EmployeeEntity.DEFAULT_PHOTO_DIR, record.params.id.toString(), request.files.photo.name);
            }
            if (record.params.photo_path) {
              const oldPhoto = path.join(
                __dirname, '..', '..', '..', '..', '..',
                'public', EmployeeEntity.DEFAULT_PHOTO_DIR, record.params.id.toString(), record.params.photo_path,
              );
              if (fsExt.pathExistsSync(oldPhoto)) {
                fsExt.removeSync(oldPhoto);
              }
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
      },
      delete: {
        before: async (request, {record}) => {
          if (record.params.photo_path) {
            const filePath = path.join(
              __dirname, '..', '..', '..', '..', '..',
              'public', EmployeeEntity.DEFAULT_PHOTO_DIR, record.params.id.toString() ,record.params.photo_path,
            )
            if (fsExt.pathExistsSync(filePath)) {
              fsExt.removeSync(filePath);
            }
          }
          return request;
        }
      }
    }
  },
  features: [
    uploadFileFeature({
      properties: {
        key: path.resolve(path.join(__dirname, '/../../../../../public/img')),
        file: 'photo',
        filePath: '/img'
        // bucket: path.resolve(path.join(__dirname, '/../../../../../public/img'))
      },
      validation: {
        //@ts-ignore
        mimeTypes: EmployeeEntity.PHOTO_MIME_TYPES,
        maxSize: EmployeeEntity.PHOTO_MAX_SIZE,
      },
      provider: {
        local: {
          bucket: path.resolve(path.join(__dirname, '/../../../../../public/img')),
        }
      }
    })
  ]
}

export const EmployeeLocaleResource: {
  [key: string]: Partial<LocaleTranslationsBlock>;
} = {
  EmployeeEntity: {
    properties: {
      full_name: 'Name',
      photo: 'Photo',
      start_date: 'Date of employment',
      chief_id: 'Chief',
      phone: 'Phone number',
      position_id: 'Position'
    }
  }
}
