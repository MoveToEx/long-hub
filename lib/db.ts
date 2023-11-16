import sqlite3 from 'sqlite3';
import { Sequelize, DataTypes } from 'sequelize';

export const seq = new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: 'database.sqlite3',
    logging: false
});

export const Post = seq.define("posts", {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    text: DataTypes.TEXT,
    image: DataTypes.STRING,
    imageHash: DataTypes.STRING,
    aggr: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    }
});

export const Tag = seq.define('tags', {
    name: DataTypes.STRING
}, {
    timestamps: false
});

export const User = seq.define('users', {
    name: DataTypes.STRING,
    accessKey: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    nickname: DataTypes.STRING,
}, {
    updatedAt: false
});

User.hasMany(Post, { foreignKey: 'uploaderId' });
Post.belongsToMany(Tag, { through: 'taggedPost' });
Tag.belongsToMany(Post, { through: 'taggedPost' });

// seq.sync({ force: true });
