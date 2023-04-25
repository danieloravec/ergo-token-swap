import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface AssetAttributes {
  tokenId: string;
  decimals: number;
  isVerified: boolean;
}

class Asset extends Model<AssetAttributes> implements AssetAttributes {
  tokenId: string;
  decimals: number;
  isVerified: boolean;
}

Asset.init({
  tokenId: {
    primaryKey: true,
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  decimals: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isVerified: {
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