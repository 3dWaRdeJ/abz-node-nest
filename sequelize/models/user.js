'use strict';
const {
  Model
} = require('sequelize');

const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'user',
    timestamps: false
  });
  user.beforeCreate(user => user.id = uuid.v4());
  user.beforeBulkCreate((users) => {
    for(const key in users) {
      users[key].id = uuid.v4();
    }
    return users;
  })
  return user;
};