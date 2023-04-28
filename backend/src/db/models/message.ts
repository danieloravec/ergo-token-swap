import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface MessageAttributes {
  id: number;
  fromAddress: string;
  toAddress: string;
  senderArchived: boolean;
  receiverArchived: boolean;
  subject: string;
  text: string;
  seen: boolean;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  id: number;
  fromAddress: string;
  toAddress: string;
  senderArchived: boolean;
  receiverArchived: boolean;
  subject: string;
  text: string;
  seen: boolean;
}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fromAddress: {
    type: DataTypes.STRING(51),
  },
  toAddress: {
    type: DataTypes.STRING(51),
  },
  senderArchived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  receiverArchived: {
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