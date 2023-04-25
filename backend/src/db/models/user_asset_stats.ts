import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface UserAssetStatsAttributes {
  userAddress: string;
  tokenId: string;
  amountBought: bigint;
  amountSold: bigint;
}

class UserAssetStats extends Model<UserAssetStatsAttributes> implements UserAssetStatsAttributes {
  userAddress: string;
  tokenId: string;
  amountBought: bigint;
  amountSold: bigint;
}

UserAssetStats.init({
  userAddress: {
    type: DataTypes.STRING(51),
    allowNull: false,
  },
  tokenId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  amountBought: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: BigInt(0),
  },
  amountSold: {
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