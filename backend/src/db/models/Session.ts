import { DataTypes, Model, Optional } from 'sequelize'
import sequelizeConnection from '@db/config'

interface SessionAttributes {
    id: number;
    secret: string;
    createdAt: Date;
    creatorAddr: string;
    guestAddr?: string;
    txPartial?: string;
    txPartialAddedOn?: string;
    txId?: string;
    submittedAt?: Date;
}
export interface SessionInput extends Optional<SessionAttributes, 'id'> {}
export interface SessionOuput extends Required<SessionAttributes> {}

class Session extends Model<SessionAttributes, SessionInput> implements SessionAttributes {
    public id!: number
    creatorAddr: string;
    guestAddr: string;
    secret: string;
    submittedAt: Date;
    txId: string;
    txPartial: string;

    // timestamps!
    public readonly createdAt!: Date;
    txPartialAddedOn: string;
}

Session.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false
    },
    creatorAddr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    txPartial: {
        type: DataTypes.TEXT
    },
    txPartialAddedOn: {
        type: DataTypes.DATE
    },
    txId: {
        type: DataTypes.STRING
    },
    submittedAt: {
        type: DataTypes.DATE
    },
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
})

export default Session;