import { ZodError } from 'zod';
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