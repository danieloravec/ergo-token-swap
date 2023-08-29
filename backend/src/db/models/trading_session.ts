import {DataTypes, Model, Optional} from 'sequelize'
import sequelizeConnection from '@db/config'
import { Asset } from "@types";
import { EIP12UnsignedTransaction, SignedInput } from "@fleet-sdk/common";
import * as types from "@types";

/* tslint:disable variable-name */
interface TradingSessionAttributes {
    id: number;
    secret: string;
    created_at: Date;
    host_addr: string;
    host_assets_json: Asset[];
    host_nano_erg: bigint;
    guest_addr?: string;
    guest_assets_json?: Asset[];
    guest_nano_erg?: bigint;
    unsigned_tx?: EIP12UnsignedTransaction;
    unsigned_tx_added_on?: string;
    signed_inputs_host?: SignedInput[];
    tx_input_indices_host?: number[];
    tx_input_indices_guest?: number[];
    nfts_for_a?: types.Nft[];
    nfts_for_b?: types.Nft[];
    fungible_tokens_for_a?: types.FungibleToken[];
    fungible_tokens_for_b?: types.FungibleToken[];
    nano_erg_for_a?: bigint;
    nano_erg_for_b?: bigint;
    input_indices_rewards?: number[];
    signed_rewards_inputs?: SignedInput[];
    tx_id?: string;
    submitted_at?: Date;
}

export interface TradingSessionInput extends Optional<TradingSessionAttributes, 'id'> {
}

class TradingSession extends Model<TradingSessionAttributes, TradingSessionInput> implements TradingSessionAttributes {
    public id!: number
    host_addr!: string;
    host_assets_json!: Asset[];
    host_nano_erg!: bigint;
    guest_addr: string;
    guest_assets_json: Asset[];
    guest_nano_erg: bigint;
    secret!: string;
    submitted_at: Date;
    tx_id?: string;
    unsigned_tx?: EIP12UnsignedTransaction;
    unsigned_tx_added_on?: string;
    signed_inputs_host?: SignedInput[];
    tx_input_indices_host?: number[];
    tx_input_indices_guest?: number[];
    nfts_for_a?: types.Nft[];
    nfts_for_b?: types.Nft[];
    fungible_tokens_for_a?: types.FungibleToken[];
    fungible_tokens_for_b?: types.FungibleToken[];
    nano_erg_for_a?: bigint;
    nano_erg_for_b?: bigint;
    input_indices_rewards?: number[];
    signed_rewards_inputs?: SignedInput[];
    public readonly created_at!: Date;
}

TradingSession.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    created_at: {
        type: DataTypes.DATE,
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false
    },
    host_addr: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    host_assets_json: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    host_nano_erg: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    unsigned_tx: {
        type: DataTypes.JSONB,
    },
    unsigned_tx_added_on: {
        type: DataTypes.DATE
    },
    signed_inputs_host: {
        type: DataTypes.JSONB,
    },
    tx_input_indices_host: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    tx_input_indices_guest: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    guest_addr: {
        type: DataTypes.STRING,
    },
    guest_assets_json: {
        type: DataTypes.JSONB,
    },
    guest_nano_erg: {
        type: DataTypes.BIGINT,
    },
    tx_id: {
        type: DataTypes.STRING,
    },
    submitted_at: {
        type: DataTypes.DATE,
    },
    nfts_for_a: {
        type: DataTypes.JSONB
    },
    nfts_for_b: {
        type: DataTypes.JSONB
    },
    fungible_tokens_for_a: {
        type: DataTypes.JSONB
    },
    fungible_tokens_for_b: {
        type: DataTypes.JSONB
    },
    nano_erg_for_a: {
        type: DataTypes.BIGINT
    },
    nano_erg_for_b: {
        type: DataTypes.BIGINT
    },
    input_indices_rewards: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    signed_rewards_inputs: {
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