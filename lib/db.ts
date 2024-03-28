import _ from 'lodash';
import path from 'node:path';
import crypto from 'crypto';
import mysql from 'mysql2';

import { PrismaClient } from '@prisma/client';

import { config } from 'dotenv';

config({
    path: '.env.local'
});

if (process.env.MEDIA_ROOT === undefined) {
    throw Error();
}

export const prisma = new PrismaClient().$extends({
    result: {
        post: {
            imageURL: {
                needs: {
                    image: true,
                },
                compute(post) {
                    if (!post.image) return '';
                    return process.env.MEDIA_URL_PREFIX + '/posts/' + post.image;
                }
            },
            imagePath: {
                needs: {
                    image: true
                },
                compute(post) {
                    if (!post.image) return '';
                    return path.join(process.env.MEDIA_ROOT!, 'posts', post.image);
                }
            }
        },
        template: {
            imageURL: {
                needs: {
                    image: true,
                },
                compute(template) {
                    if (!template.image) return '';
                    return process.env.MEDIA_URL_PREFIX + '/templates/' + template.image;
                }
            },
            imagePath: {
                needs: {
                    image: true
                },
                compute(template) {
                    if (!template.image) return '';
                    return path.join(process.env.MEDIA_ROOT!, 'templates', template.image);
                }
            }
        }
    }
});
