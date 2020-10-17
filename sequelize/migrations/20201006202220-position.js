'use strict';
const tableName = require('../models').position.tableName;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      level: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED
      },
      'chief_position_id': {
        allowNull: true,
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: null,
        references: {
          model: 'positions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      'admin_create_id': {
        allowNull: false,
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade'
      },
      'admin_update_id': {
        allowNull: false,
        type: Sequelize.STRING(36),
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW() ON UPDATE NOW()')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamp: false
    });

    await queryInterface.addIndex(tableName, ['name']);
    await queryInterface.addIndex(tableName, ['level']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(tableName);
  }
};
