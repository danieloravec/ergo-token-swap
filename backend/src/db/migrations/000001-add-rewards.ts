import {DataTypes, QueryInterface} from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.addColumn('trading_sessions', 'input_indices_rewards', {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
      });

      await queryInterface.addColumn('trading_sessions', 'signed_rewards_inputs', {
        type: DataTypes.JSONB,
        allowNull: true,
      });

      await queryInterface.createTable('rewards', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        token_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        reserved_at: {
          type: DataTypes.DATE,
        },
        giveaway_tx_id: {
          type: DataTypes.STRING,
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      });

      await queryInterface.addIndex('rewards', ['token_id'], {
        unique: true,
      });
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.removeColumn('trading_sessions', 'input_indices_rewards');
      await queryInterface.removeColumn('trading_sessions', 'signed_rewards_inputs');

      await queryInterface.removeIndex('rewards', ['token_id']);
      await queryInterface.dropTable('rewards');
    }
  )
};