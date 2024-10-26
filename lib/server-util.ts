import { IronSession, getIronSession } from "iron-session";
import { Session } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ZodError } from 'zod';
import _ from 'lodash';

export const cookieSettings = {
    password: process.env['COOKIE_SECRET'] as string,
    cookieName: process.env['COOKIE_NAME'] as string,
    ttl: 60 * 24 * 60 * 60,
}

export function formatZodError(error: ZodError): string {
    const data = error.flatten();
    const msg = _.concat(
        data.formErrors,
        _.toPairs(data.fieldErrors).map(([field, msg]) => `Error parsing ${field}: ${msg}`)
    );
    return msg.join('\n');
}

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