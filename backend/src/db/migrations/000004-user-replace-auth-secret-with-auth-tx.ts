import {DataTypes, QueryInterface} from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.removeColumn('users', 'auth_secret');
      await queryInterface.addColumn('users', 'auth_tx_id', {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await queryInterface.addColumn('users', 'auth_tx_box_to_validate', {
        type: DataTypes.JSONB,
        allowNull: true,
      });
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await  queryInterface.removeColumn('users', 'auth_tx_box_to_validate');
      await  queryInterface.removeColumn('users', 'auth_tx_id');
      await queryInterface.addColumn('users', 'auth_secret', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  )
};