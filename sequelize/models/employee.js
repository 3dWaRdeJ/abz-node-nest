const Sequelize = require('sequelize');
const {
  Model
} = Sequelize;

module.exports = (sequelize, DataTypes) => {
  class employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      employee.belongsTo(employee, {
        as: 'chief',
        foreignKey: 'chief_id'
      });
      employee.hasMany(employee, {
        as: 'sub_employees',
        foreignKey: 'chief_id'
      })
      employee.belongsTo(sequelize.models.position, {
        as: 'position',
        foreignKey: 'position_id'
      })
      employee.belongsTo(sequelize.models.user, {
        as: 'create_admin',
        foreignKey: 'admin_create_id'
      });
      employee.belongsTo(sequelize.models.user, {
        as: 'update_admin',
        foreignKey: 'admin_update_id'
      })
    }
  };

  employee.init({
    full_name: DataTypes.STRING,
    salary: DataTypes.FLOAT.UNSIGNED,
    start_date: DataTypes.DATEONLY,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    photo_path: DataTypes.STRING,
    chief_id: DataTypes.INTEGER.UNSIGNED,
    position_id: DataTypes.INTEGER.UNSIGNED,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    admin_create_id: DataTypes.INTEGER.UNSIGNED,
    admin_update_id: DataTypes.INTEGER.UNSIGNED
  }, {
    sequelize,
    modelName: 'employee',
    timestamps: false
  });
  return employee;
};