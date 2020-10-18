'use strict';
const models = require('../models');
const Employee = models.employee;
const Position = models.position;
const faker = require('faker/locale/ru');

function randomValue(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function employeeFactory(positions, employeeCount = 1000) {
  let res = [];
  let randomAdmins = await models.user.findAll({order: models.sequelize.literal('RAND()'), limit: 10});

  for (let i = 0; i < employeeCount; i++) {
    let randomAdmin = randomAdmins[randomValue(randomAdmins.length)];
    res.push({
      full_name: faker.name.findName(),
      salary: parseFloat(randomValue(50000) + 1 + '.' + randomValue(100)),
      'start_date': faker.date.between(1970, new Date),
      phone: faker.phone.phoneNumber('+380#########'),
      email: faker.internet.email().toLowerCase(),
      'position_id': positions[i % positions.length].id,
      'admin_create_id': randomAdmin.id,
      'admin_update_id': randomAdmin.id
    });
  }
  return res;
}

function sortEmployeesByPositionId(employees) {
  let employeesByPosId = {};
  for(const employee of employees) {
    if (Array.isArray(employeesByPosId[employee['position_id']]) == false) {
      employeesByPosId[employee['position_id']] = [];
    }
    employeesByPosId[employee['position_id']].push(employee);
  }
  return employeesByPosId;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let allPositionsByLevel = await Position.findAll({
      order: [['level', 'DESC']]
    });
    let employees = await employeeFactory(allPositionsByLevel, 50000);
    let employeesByPosId = sortEmployeesByPositionId(employees);
    for(const position of allPositionsByLevel) {
      let posEmployees = employeesByPosId[position.id];
      let fields = ['full_name', 'salary', 'start_date', 'phone', 'email', 'position_id' ,'admin_create_id', 'admin_update_id'];
      if (position['chief_position_id'] !== null) {
        fields.push('chief_id');
        let possibleChiefs = employeesByPosId[position['chief_position_id']];
        for(let employee of posEmployees) {
          employee['chief_id'] = possibleChiefs[randomValue(possibleChiefs.length)].id;
        }
      }
      employeesByPosId[position.id] = await Employee.bulkCreate(posEmployees, fields);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await Employee.destroy({
      where: {},
      cascade: true
    });
  }
};
