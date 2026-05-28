// backend/src/models/ProfessionalServiceSelection.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class ProfessionalServiceSelection extends Model<
  InferAttributes<ProfessionalServiceSelection>,
  InferCreationAttributes<ProfessionalServiceSelection>
> {
  declare id: CreationOptional<number>;

  declare professionalServiceId: number;
  declare clientUserId: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProfessionalServiceSelection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    professionalServiceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "professional_service_id",
    },

    clientUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "client_user_id",
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
    modelName: "ProfessionalServiceSelection",
    tableName: "professional_service_selections",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "uniq_service_user",
        unique: true,
        fields: ["professional_service_id", "client_user_id"],
      },
    ],
  }
);
