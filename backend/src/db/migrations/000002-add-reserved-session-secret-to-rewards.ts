import {DataTypes, QueryInterface} from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.addColumn('rewards', 'reserved_session_secret', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.removeColumn('rewards', 'reserved_session_secret');
    }
  )
};