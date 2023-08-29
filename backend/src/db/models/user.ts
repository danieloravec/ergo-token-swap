import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface UserAttributes {
  address: string;
  username: string;
  email: string;
  discord: string;
  twitter: string;
  allow_messages: boolean;
  created_at: Date;
  auth_secret?: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public address!: string;
  allow_messages!: boolean;
  discord: string;
  email: string;
  twitter: string;
  username: string;
  public readonly created_at!: Date;
  auth_secret?: string;
}

User.init({
  address: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  allow_messages: {
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
  created_at: {
    type: DataTypes.DATE,
  },
  auth_secret: {
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
    attributes: { exclude: ['auth_secret'] },
  }
})

export default User;