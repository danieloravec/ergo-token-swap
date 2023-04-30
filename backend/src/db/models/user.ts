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
  authSecret?: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public address!: string;
  allowMessages!: boolean;
  discord: string;
  email: string;
  twitter: string;
  username: string;
  public readonly createdAt!: Date;
  authSecret?: string;
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
  },
  authSecret: {
    type: DataTypes.STRING,
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
  defaultScope: {
    attributes: { exclude: ['authSecret'] },
  }
})

export default User;