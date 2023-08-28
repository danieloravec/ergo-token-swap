import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface CollectionAttributes {
  name: string;
  description: string;
  minting_addresses: string[];
}

class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  name: string;
  description: string;
  minting_addresses: string[];
}

Collection.init({
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  minting_addresses: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
})

export default Collection;