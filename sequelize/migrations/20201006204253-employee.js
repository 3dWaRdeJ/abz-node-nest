'use strict';
const tableName = require('../models').employee.tableName;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      salary: {
        allowNull: false,
        type: Sequelize.FLOAT.UNSIGNED,
      },
      'start_date': {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING(16)
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      'photo_path': {
        allowNull: true,
        type: Sequelize.STRING
      },
      'chief_id': {
        allowNull: true,
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      'position_id': {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'positions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      'admin_create_id': {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade'
      },
      'admin_update_id': {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade'
      },
      'created_at': {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      'updated_at': {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW() ON UPDATE NOW()')
      }
    }, {
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    //sequelize don`t add FULLTEXT index so do it by query
    await queryInterface.sequelize.query(`ALTER TABLE ${tableName} ADD FULLTEXT full_name_FT_IDX(full_name)`);
    await queryInterface.addIndex(tableName, ['salary']);
    await queryInterface.addIndex(tableName, ['start_date']);
    await queryInterface.addIndex(tableName, ['phone']);
    await queryInterface.addIndex(tableName, ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};
