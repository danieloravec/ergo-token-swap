import {DataTypes, Model} from 'sequelize'
import sequelizeConnection from '@db/config'

interface MessageAttributes {
  fromAddress: string;
  toAddress: string;
  text: string;
  seen: boolean;
}

class Message extends Model<MessageAttributes> implements MessageAttributes {
  fromAddress: string;
  toAddress: string;
  text: string;
  seen: boolean;
}

Message.init({
  fromAddress: {
    type: DataTypes.STRING(51),
  },
  toAddress: {
    type: DataTypes.STRING(51),
  },
  text: {
    type: DataTypes.STRING(1000),
  },
  seen: {
    type: DataTypes.BOOLEAN,
  },
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