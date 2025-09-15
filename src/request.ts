import { IncomingMessage } from 'http';
import { BlazeRequest } from './types';

export function enhanceRequest(req: IncomingMessage): BlazeRequest {
    const blazeReq = req as BlazeRequest;
    return blazeReq;
}

export async function parseBody(req: BlazeRequest): Promise<void> {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const contentType = req.headers['content-type'];

                if (contentType?.includes('application/json')) {
                    req.body = JSON.parse(body);
                } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                    req.body = parseUrlEncoded(body);
                } else {
                    req.body = body;
                }

                resolve();
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', reject);
    });
}

function parseUrlEncoded(body: string): Record<string, string> {
    const params: Record<string, string> = {};
    body.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    return params;
}
