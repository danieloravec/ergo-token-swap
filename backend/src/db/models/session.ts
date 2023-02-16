import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'
import { Asset } from "@types";
import { EIP12UnsignedTransaction, SignedInput } from "@fleet-sdk/common";

interface SessionAttributes {
    id: number;
    secret: string;
    createdAt: Date;
    creatorAddr: string;
    creatorAssetsJson: Asset[];
    creatorNanoErg: bigint;
    guestAddr?: string;
    guestAssetsJson?: Asset[];
    guestNanoErg?: bigint;
    unsignedTx?: EIP12UnsignedTransaction;
    unsignedTxAddedOn?: string;
    signedInputsCreator?: SignedInput[];
    txInputIndicesCreator?: number[];
    txInputIndicesGuest?: number[];
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
    creatorAssetsJson!: Asset[];
    creatorNanoErg!: bigint;
    guestAddr: string;
    guestAssetsJson: Asset[];
    guestNanoErg: bigint;
    secret!: string;
    submittedAt: Date;
    txId?: string;
    unsignedTx?: EIP12UnsignedTransaction;
    unsignedTxAddedOn?: string;
    signedInputsCreator?: SignedInput[];
    txInputIndicesCreator?: number[];
    txInputIndicesGuest?: number[];
    public readonly createdAt!: Date;
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
    unsignedTx: {
        type: DataTypes.JSONB,
    },
    unsignedTxAddedOn: {
        type: DataTypes.DATE
    },
    signedInputsCreator: {
        type: DataTypes.JSONB,
    },
    txInputIndicesCreator: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    txInputIndicesGuest: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
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