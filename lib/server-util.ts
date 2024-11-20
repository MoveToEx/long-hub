import { z } from 'zod';
import _ from 'lodash';

export const responses = {
    forbidden() {
        return new Response(null, {
            status: 403
        })
    },
    unauthorized() {
        return new Response(null, {
            status: 401
        })
    },
    notFound(entity: string) {
        return new Response(entity + ' not found', {
            status: 404
        });
    },
    badRequest(reason: string) {
        return new Response(reason, {
            status: 400
        });
    }
}

export const z_json = z.string().transform((value, context) => {
    try {
        return JSON.parse(value);
    }
    catch (e) {
        context.addIssue({
            code: 'custom',
            message: 'Invalid JSON'
        });
        return z.NEVER;
    }
});