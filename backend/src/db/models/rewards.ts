import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface RewardAttributes {
  token_id: string;
  available: boolean;
}

class Reward extends Model<RewardAttributes> implements RewardAttributes {
  token_id: string;
  available: boolean;
}

Reward.init({
  token_id: {
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