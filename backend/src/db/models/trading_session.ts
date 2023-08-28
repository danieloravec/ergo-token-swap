import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'
import { Asset } from "@types";
import { EIP12UnsignedTransaction, SignedInput } from "@fleet-sdk/common";
import * as types from "@types";

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
    nftsForA?: types.Nft[];
    nftsForB?: types.Nft[];
    fungibleTokensForA?: types.FungibleToken[];
    fungibleTokensForB?: types.FungibleToken[];
    nanoErgForA?: bigint;
    nanoErgForB?: bigint;
    inputIndicesRewards?: number[];
    signedRewardsInputs?: SignedInput[];
    txId?: string;
    submittedAt?: Date;
}

export interface TradingSessionInput extends Optional<TradingSessionAttributes, 'id'> {
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
    nftsForA?: types.Nft[];
    nftsForB?: types.Nft[];
    fungibleTokensForA?: types.FungibleToken[];
    fungibleTokensForB?: types.FungibleToken[];
    nanoErgForA?: bigint;
    nanoErgForB?: bigint;
    inputIndicesRewards?: number[];
    signedRewardsInputs?: SignedInput[];
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
    nftsForA: {
        type: DataTypes.JSONB
    },
    nftsForB: {
        type: DataTypes.JSONB
    },
    fungibleTokensForA: {
        type: DataTypes.JSONB
    },
    fungibleTokensForB: {
        type: DataTypes.JSONB
    },
    nanoErgForA: {
        type: DataTypes.BIGINT
    },
    nanoErgForB: {
        type: DataTypes.BIGINT
    },
    inputIndicesRewards: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    signedRewardsInputs: {
        type: DataTypes.JSONB,
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