import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'

interface UserAttributes {
  address: string;
  username: string;
  email: string;
  discord: string;
  twitter: string;
  allowMessages: boolean;
  createdAt: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public address!: string;
  allowMessages!: boolean;
  discord: string;
  email: string;
  twitter: string;
  username: string;
  public readonly createdAt!: Date;
}

User.init({
  address: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  allowMessages: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  discord: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  twitter: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
  indexes: [
    {
      fields: ['address'],
      unique: true,
    },
  ],
})

export default User;