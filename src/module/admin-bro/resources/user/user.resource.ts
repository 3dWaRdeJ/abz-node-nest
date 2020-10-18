import {UserEntity} from "../../../user/user.entity";
import * as bcrypt from "bcryptjs";
import {PropertyErrors, ResourceOptions, ValidationError} from "admin-bro";
import {LocaleTranslationsBlock} from "admin-bro/src/locale/config";
import {EmployeeEntity} from "../../../employee/employee.entity";
import {EmployeeLocaleResource} from "../employee/employee.resource";
import {RecordError} from "admin-bro/types/src/backend/utils/validation-error";

function checkRequiredProps(user: UserEntity) {
  const propErrors: PropertyErrors = {};
  const reqPops = ['name', 'email', 'virtualPassword'];
  for (const propName of reqPops) {
    if (user[propName] === undefined || user[propName].trim() === '') {
      propErrors[propName] = {message: `${EmployeeLocaleResource.EmployeeEntity.properties[propName] ?? propName} is required`}
    }
  }

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, {message: 'You have blank required fields'});
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


function checkName(name: string, errors: PropertyErrors): boolean {

  if (name.length < 3 ) {
    errors.name = {message: 'User name must have at least 3 characters'}
    return false
  }
  //simple name validation ()
  const nameRegexp = /^[\w\dа-яА-яъёЁьыїЇґҐ_-]{3,255}$/;

  if (nameRegexp.test(name) == false) {
    errors.name = {message: 'Used wrong characters for name, allow only alphanumeric characters(latin and cyrillic) and _,-'}
    return false;
  }


  if (name.length > 255 || name.length < 3) {
    errors.name = {message: 'User name must have no more then 255 characters'}
    return false;
  }

  return true;
}

function checkPassword(password: string, errors: PropertyErrors): boolean {
  if (password.length < 3 ) {
    errors.virtualPassword = {message: 'User password must have at least 3 characters'}
    return false
  }

  if (password.length > 255 ) {
    errors.virtualPassword = {message: 'User password must have no more then 255 characters'}
    return false
  }
  return true;
}

function validateUser(user: UserEntity) {
  const propErrors: PropertyErrors = {};
  const baseError: RecordError = {message: 'Validation failed'};
  checkName(user.name, propErrors);
  checkEmail(user.name, propErrors);
  checkPassword(user.password, propErrors);

  if (Object.keys(propErrors).length > 0) {
    throw new ValidationError(propErrors, baseError);
  }
  return true;
}

export const UserResource: ResourceOptions = {
  // @ts-ignore
  resource: UserEntity,
  options: {
    properties: {
      name: {
        isRequired: true,
        isTitle: true
      },
      email: {
        isRequired: true,
        type: 'string'
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
      password: {
        isVisible: false
      },
      virtualPassword: {
        isRequired: true,
        type: 'string',
        isVisible: {
          list: false, edit: true, filter: false, show: false
        }
      }
    },
    actions: {
      new: {
        before: async (request) => {
          checkRequiredProps(request.payload);
          if (request.payload.virtualPassword) {
            request.payload = {
              ...request.payload,
              created_at: undefined,
              updated_at: undefined,
              password: bcrypt.hashSync(request.payload.virtualPassword, bcrypt.genSaltSync()),
              virtualPassword: undefined
            }
          }
          validateUser(request.payload.user);
          return request;
        }
      },
      edit: {
        before: async (request) => {
          if (request.method == 'post') {
            checkRequiredProps(request.payload)
            if (request.payload.virtualPassword) {
              request.payload = {
                ...request.payload,
                created_at: undefined,
                updated_at: undefined,
                password: bcrypt.hashSync(request.payload.virtualPassword, bcrypt.genSaltSync()),
                virtualPassword: undefined
              }
            }
            validateUser(request.payload.user);
          }
          return request;
        },
        isAccessible: ({currentAdmin, record}) => {
          return record.params.id === currentAdmin.id;
        },
      }
    }
  }
}

export const UserLocaleResource: {
  [key: string]: Partial<LocaleTranslationsBlock>;
} = {
  UserEntity: {
    properties: {
      virtualPassword: 'Password',
      created_at: 'Created at',
      updated_at: 'Updated at',
    }
  },
}
