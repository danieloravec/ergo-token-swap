import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface CollectionAttributes {
  name: string;
  description: string;
  mintingAddresses: string[];
}

class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  name: string;
  description: string;
  mintingAddresses: string[];
}

Collection.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  mintingAddresses: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
})

export default Collection;