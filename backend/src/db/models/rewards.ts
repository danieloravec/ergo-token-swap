import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface RewardAttributes {
  tokenId: string;
  available: boolean;
}

class Reward extends Model<RewardAttributes> implements RewardAttributes {
  tokenId: string;
  available: boolean;
}

Reward.init({
  tokenId: {
    type: DataTypes.STRING,
  },
  available: {
    type: DataTypes.BOOLEAN,
  }
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
  indexes: [
    {
      fields: ['token_id',],
      unique: true,
    }
  ]
})

export default Reward;