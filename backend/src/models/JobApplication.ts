// backend/src/models/JobApplication.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class JobApplication extends Model<
  InferAttributes<JobApplication>,
  InferCreationAttributes<JobApplication>
> {
  declare id: CreationOptional<number>;

  declare jobPostId: number;
  declare applicantUserId: number;
  declare message: CreationOptional<string | null>;
  declare status: CreationOptional<"PENDING" | "ACCEPTED" | "REJECTED">;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

JobApplication.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    jobPostId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "job_post_id",
    },

    applicantUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "applicant_user_id",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "message",
    },

    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
      field: "status",
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
    modelName: "JobApplication",
    tableName: "job_applications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["job_post_id", "applicant_user_id"],
      },
    ],
  }
);
