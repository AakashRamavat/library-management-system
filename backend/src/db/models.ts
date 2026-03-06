import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';

import { sequelize } from './client';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare name: string | null;
  declare memberId: string | null;
  declare passwordHash: string | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    memberId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
      // unique constraints on email and memberId already create indexes,
      // but this makes the intent explicit.
      { fields: ['email'] },
      { fields: ['memberId'] },
    ],
  },
);

export class Book extends Model<InferAttributes<Book>, InferCreationAttributes<Book>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare author: string;
  declare isbn: string | null;
  declare status: 'AVAILABLE' | 'CHECKED_OUT';
  declare holderId: string | null;
  declare thumbnailUrl: string | null;
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'CHECKED_OUT'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    holderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'books',
    modelName: 'Book',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['holderId'] },
    ],
  },
);

export class Transaction extends Model<
  InferAttributes<Transaction>,
  InferCreationAttributes<Transaction>
> {
  declare id: CreationOptional<string>;
  declare bookId: string;
  declare userId: string;
  declare action: 'CHECKOUT' | 'RETURN';
  declare createdAt: CreationOptional<Date>;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM('CHECKOUT', 'RETURN'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    modelName: 'Transaction',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['bookId', 'createdAt'] },
      { fields: ['userId', 'createdAt'] },
    ],
  },
);

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Book.hasMany(Transaction, { foreignKey: 'bookId', as: 'transactions' });

Book.belongsTo(User, { foreignKey: 'holderId', as: 'holder' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transaction.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

