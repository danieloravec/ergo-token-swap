import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface FollowAttributes {
  fromAddress: string;
  toAddress: string;
}

class Follow extends Model<FollowAttributes> implements FollowAttributes {
  fromAddress: string;
  toAddress: string;
}

Follow.init({
  fromAddress: {
    type: DataTypes.STRING,
  },
  toAddress: {
    type: DataTypes.STRING,
  }
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
  indexes: [
    {
      fields: ['from_address', 'to_address'],
      unique: true,
    }
  ]
})

export default Follow;