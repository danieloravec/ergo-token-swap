import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface RewardAttributes {
  token_id: string;
  reserved_at: Date;
  type: "mint" | "reward";
  reserved_session_secret_or_address: string;
  giveaway_tx_id: string;
  giveaway_tx_submitted_at: Date;
}

class Reward extends Model<RewardAttributes> implements RewardAttributes {
  token_id: string;
  reserved_at: Date;
  type: "mint" | "reward";
  reserved_session_secret_or_address: string;
  giveaway_tx_id: string;
  giveaway_tx_submitted_at: Date;
}

Reward.init({
  token_id: {
    type: DataTypes.STRING,
  },
  reserved_at: {
    type: DataTypes.DATE,
  },
  type: {
    type: DataTypes.STRING,
  },
  reserved_session_secret_or_address: {
    type: DataTypes.STRING,
  },
  giveaway_tx_id: {
    type: DataTypes.STRING,
  },
  giveaway_tx_submitted_at: {
    type: DataTypes.DATE,
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