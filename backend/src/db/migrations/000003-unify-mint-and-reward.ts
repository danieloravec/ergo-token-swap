import {DataTypes, QueryInterface} from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.removeColumn('rewards', 'reserved_session_secret');

      await queryInterface.addColumn('rewards', 'type', {
        type: DataTypes.STRING,
        allowNull: true,
      });

      await queryInterface.addColumn('rewards', 'reserved_session_secret_or_address', {
        type: DataTypes.STRING,
        allowNull: true,
      });

      await queryInterface.addColumn('rewards', 'giveaway_tx_submitted_at', {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await  queryInterface.removeColumn('rewards', 'type');

      await queryInterface.removeColumn('rewards', 'reserved_session_secret');

      await queryInterface.removeColumn('rewards', 'giveaway_tx_submitted_at');

      await queryInterface.addColumn('rewards', 'reserved_session_secret', {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
  )
};