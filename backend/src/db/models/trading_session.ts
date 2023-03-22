import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'
import { Asset } from "@types";
import { EIP12UnsignedTransaction, SignedInput } from "@fleet-sdk/common";

interface TradingSessionAttributes {
    id: number;
    secret: string;
    createdAt: Date;
    hostAddr: string;
    hostAssetsJson: Asset[];
    hostNanoErg: bigint;
    guestAddr?: string;
    guestAssetsJson?: Asset[];
    guestNanoErg?: bigint;
    unsignedTx?: EIP12UnsignedTransaction;
    unsignedTxAddedOn?: string;
    signedInputsHost?: SignedInput[];
    txInputIndicesHost?: number[];
    txInputIndicesGuest?: number[];
    txId?: string;
    submittedAt?: Date;
}

export interface TradingSessionInput extends Optional<TradingSessionAttributes, 'id'> {
}

export interface TradingSessionOuput extends Required<TradingSessionAttributes> {
}

class TradingSession extends Model<TradingSessionAttributes, TradingSessionInput> implements TradingSessionAttributes {
    public id!: number
    hostAddr!: string;
    hostAssetsJson!: Asset[];
    hostNanoErg!: bigint;
    guestAddr: string;
    guestAssetsJson: Asset[];
    guestNanoErg: bigint;
    secret!: string;
    submittedAt: Date;
    txId?: string;
    unsignedTx?: EIP12UnsignedTransaction;
    unsignedTxAddedOn?: string;
    signedInputsHost?: SignedInput[];
    txInputIndicesHost?: number[];
    txInputIndicesGuest?: number[];
    public readonly createdAt!: Date;
}

TradingSession.init({
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
    hostAddr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hostAssetsJson: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    hostNanoErg: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    unsignedTx: {
        type: DataTypes.JSONB,
    },
    unsignedTxAddedOn: {
        type: DataTypes.DATE
    },
    signedInputsHost: {
        type: DataTypes.JSONB,
    },
    txInputIndicesHost: {
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

export default TradingSession;