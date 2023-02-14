import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'

interface SessionAttributes {
    id: number;
    secret: string;
    createdAt: Date;
    creatorAddr: string;
    creatorAssetsJson: object;
    creatorNanoErg: bigint;
    guestAddr?: string;
    guestAssetsJson?: object;
    guestNanoErg?: bigint;
    txPartial?: string;
    txPartialAddedOn?: string;
    txId?: string;
    submittedAt?: Date;
}

export interface SessionInput extends Optional<SessionAttributes, 'id'> {
}

export interface SessionOuput extends Required<SessionAttributes> {
}

class Session extends Model<SessionAttributes, SessionInput> implements SessionAttributes {
    public id!: number
    creatorAddr!: string;
    creatorAssetsJson!: object;
    creatorNanoErg!: bigint;
    guestAddr: string;
    guestAssetsJson: object;
    guestNanoErg: bigint;
    secret!: string;
    submittedAt: Date;
    txId: string;
    txPartial: string;
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
    creatorAssetsJson: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    creatorNanoErg: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    txPartial: {
        type: DataTypes.TEXT,
    },
    txPartialAddedOn: {
        type: DataTypes.DATE,
    },
    guestAddr: {
        type: DataTypes.STRING,
    },
    guestAssetsJson: {
        type: DataTypes.JSONB,
    },
    guestNanoErg: {
        type: DataTypes.BIGINT,
    },
    txId: {
        type: DataTypes.STRING,
    },
    submittedAt: {
        type: DataTypes.DATE,
    },
}, {
    timestamps: true,
    underscored: true,
    sequelize: sequelizeConnection,
    indexes: [
        {
            fields: ['secret'],
            unique: true,
        },
    ],
})

export default Session;