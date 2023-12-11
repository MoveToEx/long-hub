import sqlite3 from 'sqlite3';
import {
    Sequelize, DataTypes, Model,
    InferAttributes, InferCreationAttributes, ForeignKey,
    HasManyGetAssociationsMixin, HasManySetAssociationsMixin, HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin,
    HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin, NonAttribute, Association, CreationOptional
} from 'sequelize';
import _ from 'lodash';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env.local'
})

if (process.env.MEDIA_ROOT === undefined) {
    throw Error();
}

export const seq = new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: 'database.sqlite3',
    logging: false
});

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
    declare id: string;
    declare text: string | null;
    declare image: string | null;
    declare imageURL: string | null;
    declare imageHash: string | null;
    declare aggr: number | null;
    declare uploaderId: ForeignKey<number> | null;

    declare getTags: HasManyGetAssociationsMixin<Tag>;
    declare addTag: HasManyAddAssociationMixin<Tag, number>;
    declare addTags: HasManyAddAssociationsMixin<Tag, number>;
    declare setTags: HasManySetAssociationsMixin<Tag, number>;
    declare removeTag: HasManyRemoveAssociationMixin<Tag, number>;
    declare removeTags: HasManyRemoveAssociationsMixin<Tag, number>;
    declare hasTag: HasManyHasAssociationMixin<Tag, number>;
    declare hasTags: HasManyHasAssociationsMixin<Tag, number>;
    declare countTags: HasManyCountAssociationsMixin;
    declare createTag: HasManyCreateAssociationMixin<Tag>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare tags: NonAttribute<Tag[]>;

    get imagePath(): NonAttribute<string> {
        if (process.env.MEDIA_ROOT === undefined) {
            throw new Error('env MEDIA_ROOT not found');
        }

        const img = this.getDataValue('image');
        if (img == null) return '';
        // path.resolve(process.env.MEDIA_ROOT);
        return path.join(process.env.MEDIA_ROOT, 'posts', img);
    }

    // declare static associations: {
    //     tags: Association<Post, Tag>;
    // }
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare email: string;
    declare name: string;
    declare nickname: string;
    declare permission: number;
    declare accessKey: string;
    declare passwordHash: string;
}

export class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
    declare name: string;

    declare getPosts: HasManyGetAssociationsMixin<Post>;
    declare addPost: HasManyAddAssociationMixin<Post, number>;
    declare addPosts: HasManyAddAssociationsMixin<Post, number>;
    declare setPosts: HasManySetAssociationsMixin<Post, number>;
    declare removePost: HasManyRemoveAssociationMixin<Post, number>;
    declare removePosts: HasManyRemoveAssociationsMixin<Post, number>;
    declare hasPost: HasManyHasAssociationMixin<Post, number>;
    declare hasPosts: HasManyHasAssociationsMixin<Post, number>;
    declare countPosts: HasManyCountAssociationsMixin;
    declare createPost: HasManyCreateAssociationMixin<Post>;

    declare posts: NonAttribute<Post[]>;
}

export class Template extends Model<InferAttributes<Template>, InferCreationAttributes<Template>> {
    declare name: string;
    declare offsetX: CreationOptional<number>;
    declare offsetY: CreationOptional<number>;
    declare rectWidth: CreationOptional<number>;
    declare rectHeight: CreationOptional<number>;
    declare style: CreationOptional<string>;
    declare image: string;
    declare imageURL: CreationOptional<string>;

    get imagePath(): NonAttribute<string> {
        if (process.env.MEDIA_ROOT === undefined) {
            throw new Error('env MEDIA_ROOT not found');
        }

        const img = this.getDataValue('image');
        if (img == null) return '';
        // path.resolve(process.env.MEDIA_ROOT);
        return path.join(process.env.MEDIA_ROOT, 'templates', img);
    }
}

User.init({
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    nickname: DataTypes.STRING,
    permission: DataTypes.INTEGER,
    accessKey: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
}, {
    sequelize: seq,
    updatedAt: false,
    tableName: 'user',
    name: {
        singular: 'user',
        plural: 'users'
    }
});

Post.init({
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    text: DataTypes.TEXT,
    image: DataTypes.STRING,
    imageHash: DataTypes.STRING,
    imageURL: {
        type: DataTypes.VIRTUAL,
        get: function () {
            if (process.env.MEDIA_URL_PREFIX === undefined) throw new Error('env MEDIA_URL_PREFIX not found');

            const img = this.getDataValue('image');
            if (img == null) return '';
            return `${_.trimEnd(process.env.MEDIA_URL_PREFIX, '/')}/posts/${img}`;
        },
        set: function (_) {
            throw new Error('imageURL should not be assigned');
        }
    },
    aggr: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize: seq,
    tableName: 'post',
    name: {
        singular: 'post',
        plural: 'posts'
    },
});

Tag.init({
    name: DataTypes.STRING
}, {
    sequelize: seq,
    tableName: 'tag',
    name: {
        singular: 'tag',
        plural: 'tags'
    },
    timestamps: false
});

Template.init({
    name: {
        primaryKey: true,
        type: DataTypes.STRING,
    },
    offsetX: DataTypes.INTEGER,
    offsetY: DataTypes.INTEGER,
    rectHeight: DataTypes.INTEGER,
    rectWidth: DataTypes.INTEGER,
    style: DataTypes.STRING,
    image: DataTypes.STRING,
    imageURL: {
        type: DataTypes.VIRTUAL,
        get: function () {
            if (process.env.MEDIA_URL_PREFIX === undefined) throw new Error('env MEDIA_URL_PREFIX not found');

            const img = this.getDataValue('image');
            if (img == null) return '';
            return `${_.trimEnd(process.env.MEDIA_URL_PREFIX, '/')}/templates/${img}`;
        },
        set: function (_) {
            throw new Error("imageURL should not be set");
        }
    }
}, {
    sequelize: seq,
    updatedAt: false
});

User.hasMany(Post, {
    foreignKey: 'uploaderId',
});
Post.belongsToMany(Tag, {
    through: 'taggedPost',
});
Tag.belongsToMany(Post, {
    through: 'taggedPost',
});

// seq.sync({ force: true });