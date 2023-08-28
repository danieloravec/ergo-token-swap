import {DataTypes, QueryInterface} from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.createTable('assets', {
        token_id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.STRING(64),
        },
        decimals: {
          allowNull: false,
          type: DataTypes.INTEGER,
        },
        is_verified: {
          allowNull: false,
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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

      await queryInterface.createTable('collections', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        name: {
          allowNull: false,
          unique: true,
          type: DataTypes.STRING,
        },
        description: {
          type: DataTypes.STRING,
        },
        minting_addresses: {
          type: DataTypes.ARRAY(DataTypes.STRING),
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

      await queryInterface.createTable('follows', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        from_address: {
          type: DataTypes.STRING,
        },
        to_address: {
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

      await queryInterface.addIndex('follows', ['from_address', 'to_address'], {
        unique: true,
      });

      await queryInterface.createTable('messages', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        from_address: {
          type: DataTypes.STRING(51),
        },
        to_address: {
          type: DataTypes.STRING(51),
        },
        sender_archived: {
          allowNull: false,
          defaultValue: false,
          type: DataTypes.BOOLEAN,
        },
        receiver_archived: {
          allowNull: false,
          defaultValue: false,
          type: DataTypes.BOOLEAN,
        },
        subject: {
          type: DataTypes.STRING(200),
        },
        text: {
          type: DataTypes.STRING(1000),
        },
        seen: {
          allowNull: false,
          defaultValue: false,
          type: DataTypes.BOOLEAN,
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

      await queryInterface.addIndex('messages', ['from_address']);
      await queryInterface.addIndex('messages', ['to_address']);

      await queryInterface.createTable('trading_sessions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        secret: {
          allowNull: false,
          type: DataTypes.STRING,
          unique: true,
        },
        host_addr: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        host_assets_json: {
          allowNull: false,
          type: DataTypes.JSONB,
        },
        host_nano_erg: {
          allowNull: false,
          type: DataTypes.BIGINT,
        },
        unsigned_tx: {
          type: DataTypes.JSONB,
        },
        unsigned_tx_added_on: {
          type: DataTypes.DATE,
        },
        signed_inputs_host: {
          type: DataTypes.JSONB,
        },
        tx_input_indices_host: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        tx_input_indices_guest: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        guest_addr: {
          type: DataTypes.STRING,
        },
        guest_assets_json: {
          type: DataTypes.JSONB,
        },
        guest_nano_erg: {
          type: DataTypes.BIGINT,
        },
        tx_id: {
          type: DataTypes.STRING,
        },
        submitted_at: {
          type: DataTypes.DATE,
        },
        nfts_for_a: {
          type: DataTypes.JSONB,
        },
        nfts_for_b: {
          type: DataTypes.JSONB,
        },
        fungible_tokens_for_a: {
          type: DataTypes.JSONB,
        },
        fungible_tokens_for_b: {
          type: DataTypes.JSONB,
        },
        nano_erg_for_a: {
          type: DataTypes.BIGINT,
        },
        nano_erg_for_b: {
          type: DataTypes.BIGINT,
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      });

      await queryInterface.addIndex('trading_sessions', ['secret'], {
        unique: true,
      });

      await queryInterface.createTable('users', {
        address: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.STRING,
        },
        allow_messages: {
          allowNull: false,
          defaultValue: true,
          type: DataTypes.BOOLEAN,
        },
        discord: {
          type: DataTypes.STRING,
        },
        email: {
          type: DataTypes.STRING,
        },
        twitter: {
          type: DataTypes.STRING,
        },
        username: {
          type: DataTypes.STRING,
        },
        created_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        auth_secret: {
          type: DataTypes.STRING,
        },
        updated_at: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      });

      await queryInterface.addIndex('users', ['address'], {
        unique: true,
      });

      await queryInterface.createTable('user_asset_stats', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        user_address: {
          allowNull: false,
          type: DataTypes.STRING(51),
        },
        token_id: {
          allowNull: false,
          type: DataTypes.STRING(64),
        },
        amount_bought: {
          allowNull: false,
          defaultValue: BigInt(0),
          type: DataTypes.BIGINT,
        },
        amount_sold: {
          allowNull: false,
          defaultValue: BigInt(0),
          type: DataTypes.BIGINT,
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

      await queryInterface.addIndex('user_asset_stats', ['user_address', 'token_id'], {
        unique: true,
      });
    }
  ),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.dropTable('assets');

      await queryInterface.dropTable('collections');

      await queryInterface.removeIndex('follows', ['from_address', 'to_address']);
      await queryInterface.dropTable('follows');

      await queryInterface.removeIndex('messages', ['from_address']);
      await queryInterface.removeIndex('messages', ['to_address']);
      await queryInterface.dropTable('messages');

      await queryInterface.removeIndex('trading_sessions', ['secret']);
      await queryInterface.dropTable('trading_sessions');

      await queryInterface.removeIndex('users', ['address']);
      await queryInterface.dropTable('users');

      await queryInterface.removeIndex('user_asset_stats', ['user_address', 'token_id']);
      await queryInterface.dropTable('user_asset_stats');
    }
  )
};