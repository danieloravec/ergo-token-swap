import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface AssetAttributes {
  token_id: string;
  decimals: number;
  is_verified: boolean;
}

class Asset extends Model<AssetAttributes> implements AssetAttributes {
  token_id: string;
  decimals: number;
  is_verified: boolean;
}

Asset.init({
  token_id: {
    primaryKey: true,
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  decimals: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
})

export default Asset;