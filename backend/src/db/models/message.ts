import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

/* tslint:disable variable-name */
interface MessageAttributes {
  id: number;
  from_address: string;
  to_address: string;
  sender_archived: boolean;
  receiver_archived: boolean;
  subject: string;
  text: string;
  seen: boolean;
  created_at: Date;
  updated_at: Date;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  id: number;
  from_address: string;
  to_address: string;
  sender_archived: boolean;
  receiver_archived: boolean;
  subject: string;
  text: string;
  seen: boolean;
  created_at: Date;
  updated_at: Date;
}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  from_address: {
    type: DataTypes.STRING(51),
  },
  to_address: {
    type: DataTypes.STRING(51),
  },
  sender_archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  receiver_archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  subject: {
    type: DataTypes.STRING(200),
  },
  text: {
    type: DataTypes.STRING(1000),
  },
  seen: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
  underscored: true,
  sequelize: sequelizeConnection,
  indexes: [
    {
      fields: ['from_address'],
    },
    {
      fields: ['to_address'],
    }
  ],
})

export default Message;