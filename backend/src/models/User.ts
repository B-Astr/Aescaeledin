// backend/src/models/User.ts
import { DataTypes, Model } from "sequelize";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;

  declare email: string;
  declare role: string;

  declare name: string | null;
  declare picture: string | null;
  declare googleSub: string | null;

  declare otpSecret: string | null;
  declare otpEnabled: CreationOptional<boolean>;

  // Perfil extendido
  declare headline: string | null;
  declare bio: string | null;
  declare phone: string | null;
  declare location: string | null;
  declare website: string | null;
  declare linkedinUrl: string | null;
  declare githubUrl: string | null;
  declare experience: string | null;
  declare education: string | null;
  declare skills: string | null;
  declare resumeUrl: string | null;
  declare publicProfileVisible: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    role: {
      type: DataTypes.ENUM("CLIENTE", "PRO", "EMPRESA"),
      allowNull: false,
      defaultValue: "CLIENTE",
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    googleSub: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: "google_sub",
    },

    otpSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "otp_secret",
    },

    otpEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "otp_enabled",
    },

    headline: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "website",
    },

    linkedinUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "linkedin_url",
    },

    githubUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "github_url",
    },

    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    resumeUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "resume_url",
    },

    publicProfileVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "public_profile_visible",
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
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);
