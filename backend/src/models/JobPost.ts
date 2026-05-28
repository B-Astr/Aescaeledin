// backend/src/models/JobPost.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class JobPost extends Model<
  InferAttributes<JobPost>,
  InferCreationAttributes<JobPost>
> {
  declare id: CreationOptional<number>;

  declare companyUserId: number;
  declare title: string;
  declare description: string;
  declare location: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare placeId: string | null;
  declare employmentType: string;
  declare isActive: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

JobPost.init(
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

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
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

    employmentType: {
      type: DataTypes.ENUM("FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"),
      allowNull: false,
      defaultValue: "FULL_TIME",
      field: "employment_type",
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
    modelName: "JobPost",
    tableName: "job_posts",
    timestamps: true,
    underscored: true,
  }
);
