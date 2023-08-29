import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface FollowAttributes {
  from_address: string;
  to_address: string;
}

class Follow extends Model<FollowAttributes> implements FollowAttributes {
  from_address: string;
  to_address: string;
}

Follow.init({
  from_address: {
    type: DataTypes.STRING,
  },
  to_address: {
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