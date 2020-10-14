'use strict';
const models = require('../models');
const position = models.position;
const faker = require('faker/locale/ru');

function randomValue(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function createPositions(level = 5, chiefId = null) {
  //get random admin
  let randomAdmins = await models.user.findAll({order: models.sequelize.literal('RAND()'), limit: 10});
  //array for create positions
  let pos = [];
  //fields for insert
  let fields = ['name', 'level', 'admin_create_id', 'admin_update_id'];

  if (typeof chiefId == 'number') {
    fields.push('chief_position_id');
  }

  //random count of create position
  let posCount = randomValue(5) + 1;

  for (let i = 0; i < posCount; i++) {
    let randomAdmin = randomAdmins[randomValue(randomAdmins.length)];
    let posObj = {
      name: faker.name.jobTitle(),
      level: level,
      'admin_create_id': randomAdmin.id,
      'admin_update_id': randomAdmin.id
    };
    if (typeof (chiefId) == 'number') {
      posObj['chief_position_id'] = chiefId;
    }
    pos.push(posObj);
  }
  let create = position.bulkCreate(pos, {fields: fields});
  if (--level > 0) {
    create = create.then(async (resObjs) => {
      for (const posObj of resObjs) {
        await createPositions(level, posObj.id)
      }
    });
  }
  await create;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await createPositions();
  },

  down: async (queryInterface, Sequelize) => {
    await position.destroy({
      where: {},
      cascade: true
    });
  },
};
