// backend/src/models/ProfessionalServiceSelection.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class ProfessionalService extends Model<
  InferAttributes<ProfessionalService>,
  InferCreationAttributes<ProfessionalService>
> {
  declare id: CreationOptional<number>;

  declare professionalUserId: number;
  declare title: string;
  declare description: string;
  declare category: string;
  declare location: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare placeId: string | null;
  declare price: string | null;
  declare isActive: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProfessionalService.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    professionalUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "professional_user_id",
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    placeId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "place_id",
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },

    createdAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "ProfessionalService",
    tableName: "professional_services",
    timestamps: true,
    underscored: true,
  }
);
