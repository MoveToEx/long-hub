import _ from 'lodash';
import path from 'node:path';

import { PrismaClient } from '@prisma/client';

import env from '@/lib/env';

export const prisma = new PrismaClient().$extends({
    result: {
        post: {
            imageURL: {
                needs: {
                    image: true,
                },
                compute: post => env.MEDIA_URL_PREFIX + '/posts/' + post.image
            },
            imagePath: {
                needs: {
                    image: true
                },
                compute: post => path.join(env.MEDIA_ROOT, 'posts', post.image)
            }
        },
        template: {
            imageURL: {
                needs: {
                    image: true,
                },
                compute(template) {
                    return env.MEDIA_URL_PREFIX + '/templates/' + template.image;
                }
            },
            imagePath: {
                needs: {
                    image: true
                },
                compute(template) {
                    if (!template.image) return '';
                    return path.join(env.MEDIA_ROOT!, 'templates', template.image);
                }
            }
        }
    }
});
