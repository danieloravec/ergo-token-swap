import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'
import {EIP12UnsignedTransaction} from "@fleet-sdk/common";
import {Amount, Box} from "@fleet-sdk/core";

/* tslint:disable variable-name */
interface UserAttributes {
  address: string;
  username: string;
  email: string;
  discord: string;
  twitter: string;
  allow_messages: boolean;
  created_at: Date;
  auth_tx_id?: string;
  auth_tx_box_to_validate: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public address!: string;
  allow_messages!: boolean;
  discord: string;
  email: string;
  twitter: string;
  username: string;
  public readonly created_at!: Date;
  auth_tx_id: string;
  auth_tx_box_to_validate: string;
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
  auth_tx_id: {
    type: DataTypes.STRING,
  },
  auth_tx_box_to_validate: {
    type: DataTypes.JSONB,
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