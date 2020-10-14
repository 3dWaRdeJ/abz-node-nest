'use strict';
const {
  Model
} = require('sequelize');

const models = require('./index');

module.exports = (sequelize, DataTypes) => {
  class position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      position.belongsTo(position, {
        as: 'chief_position',
        foreignKey: 'chief_position_id',
      });
      position.hasMany(position, {
        as: 'sub_positions',
        foreignKey: 'chief_position_id'
      })
      position.hasMany(models.employee, {
        as: 'employees',
        foreignKey: 'position_id'
      })
      position.belongsTo(models.user, {
        as: 'create_admin',
        foreignKey: 'admin_create_id'
      });
      position.belongsTo(models.user, {
        as: 'update_admin',
        foreignKey: 'admin_update_id'
      })
    }
  };
  position.init({
    name: DataTypes.STRING,
    level: DataTypes.INTEGER.UNSIGNED,
    chief_position_id: DataTypes.INTEGER.UNSIGNED,
    admin_create_id: DataTypes.INTEGER.UNSIGNED,
    admin_update_id: DataTypes.INTEGER.UNSIGNED,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'position',
    timestamps: false
  });
  return position;
};