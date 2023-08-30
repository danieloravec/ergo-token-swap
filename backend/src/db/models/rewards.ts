import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface RewardAttributes {
  token_id: string;
  reserved_at: Date;
  reserved_session_secret: string;
  giveaway_tx_id: string;
}

class Reward extends Model<RewardAttributes> implements RewardAttributes {
  token_id: string;
  reserved_at: Date;
  reserved_session_secret: string;
  giveaway_tx_id: string;
}

Reward.init({
  token_id: {
    type: DataTypes.STRING,
  },
  reserved_at: {
    type: DataTypes.DATE,
  },
  reserved_session_secret: {
    type: DataTypes.STRING,
  },
  giveaway_tx_id: {
    type: DataTypes.STRING,
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