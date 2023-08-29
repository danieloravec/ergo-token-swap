import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface UserAssetStatsAttributes {
  user_address: string;
  token_id: string;
  amount_bought: bigint;
  amount_sold: bigint;
}

class UserAssetStats extends Model<UserAssetStatsAttributes> implements UserAssetStatsAttributes {
  user_address: string;
  token_id: string;
  amount_bought: bigint;
  amount_sold: bigint;
}

UserAssetStats.init({
  user_address: {
    type: DataTypes.STRING(51),
    allowNull: false,
  },
  token_id: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  amount_bought: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: BigInt(0),
  },
  amount_sold: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: BigInt(0),
  },
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
  indexes: [
    {
      fields: ['user_address', 'token_id'],
      unique: true,
    }
  ]
})

export default UserAssetStats;