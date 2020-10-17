import {ResourceOptions} from "admin-bro";
import {EmployeeEntity} from "../../../employee/employee.entity";
import uploadFileFeature from "@admin-bro/upload";
import * as path from "path";

export const EmployeeResource: ResourceOptions = {
  // @ts-ignore
  resource: EmployeeEntity,
  options: {
    properties: {
      id: {position:0},
      full_name: {position:1, isTitle: true, isRequired: true},
      position_id: {position:2, isRequired: true},
      start_date: {position:3, type: 'date', isRequired: true},
      phone: {position:4, isRequired: true},
      email: {position:5, isRequired: true},
      salary: {position:6, isRequired: true},
      photo_path: {
        isVisible: false
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
          request.payload = {
            ...request.payload,
            admin_create_id: currentAdmin.id,
            admin_update_id: currentAdmin.id,
          }
          return request
        }
      },
      edit: {
        before: async (request, {currentAdmin }) => {
          request.payload = {
            ...request.payload,
            admin_update_id: currentAdmin.id,
          }
          return request
        }
      }
    }
  },
  features: [
    uploadFileFeature({
      properties: {
        key: path.resolve(path.join(__dirname, '/../../../../../public/img')),
        file: 'photo',
        bucket: path.resolve(path.join(__dirname, '/../../../../../public/img'))
      },
      validation: {
        mimeTypes: [
          'image/png',
          'image/jpeg',
        ],
        maxSize: 5*1024*1024,
      },
      provider: {
        local: {
          bucket: __dirname
        }
      }
    })
  ]
}
