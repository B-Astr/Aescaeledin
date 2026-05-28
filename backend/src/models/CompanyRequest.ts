//backend/src/models/CompanyRequest.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class CompanyRequest extends Model<
  InferAttributes<CompanyRequest>,
  InferCreationAttributes<CompanyRequest>
> {
  declare id: CreationOptional<number>;

  declare companyUserId: number;
  declare professionalUserId: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CompanyRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    companyUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "company_user_id",
    },

    professionalUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "professional_user_id",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "CompanyRequest",
    tableName: "company_requests",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "uniq_company_professional",
        unique: true,
        fields: ["company_user_id", "professional_user_id"],
      },
    ],
  }
);