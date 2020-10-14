'use strict';
const user = require('../models').user;
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await user.bulkCreate([
        {
          name: 'admin',
          email: 'admin@test.com',
          password: bcrypt.hashSync('admin', bcrypt.genSaltSync(10))
        },
      {
        name: 'root',
        email: 'root@test.com',
        password: bcrypt.hashSync('root', bcrypt.genSaltSync(10))
      }
    ], {fields: ['name', 'email', 'password']});
  },

  down: async (queryInterface, Sequelize) => {
    await user.destroy({
      where: {},
      cascade: true
    });
  }
};
