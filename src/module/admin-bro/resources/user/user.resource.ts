import {UserEntity} from "../../../user/user.entity";
import * as bcrypt from "bcryptjs";
import {ResourceOptions} from "admin-bro";

export const UserResource: ResourceOptions = {
  // @ts-ignore
  resource: UserEntity,
  options: {
    properties: {
      name: {
        isTitle: true
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
          if (request.payload.virtualPassword) {
            request.payload = {
              ...request.payload,
              password: bcrypt.hashSync(request.payload.virtualPassword, bcrypt.genSaltSync()),
              virtualPassword: undefined
            }
          }
          return request;
        }
      },
      edit: {
        before: async (request) => {
          if (request.payload.virtualPassword) {
            request.payload = {
              ...request.payload,
              password: bcrypt.hashSync(request.payload.virtualPassword, bcrypt.genSaltSync()),
              virtualPassword: undefined
            }
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