import { BlazeRequest, BlazeResponse, Handler, HttpMethod, Route, NextFunction } from './types';

export class Router {
    private routes: Route[] = [];
    private middleware: Handler[] = [];

    use(handler: Handler): void;
    use(path: string, handler: Handler): void;
    use(pathOrHandler: string | Handler, handler?: Handler): void {
        if (typeof pathOrHandler === 'string' && handler) {
            // Path-specific middleware (simplified - just store as regular middleware for now)
            this.middleware.push(handler);
        } else {
            this.middleware.push(pathOrHandler as Handler);
        }
    }

    get(path: string, handler: Handler): void {
        this.addRoute('GET', path, handler);
    }

    post(path: string, handler: Handler): void {
        this.addRoute('POST', path, handler);
    }

    put(path: string, handler: Handler): void {
        this.addRoute('PUT', path, handler);
    }

    delete(path: string, handler: Handler): void {
        this.addRoute('DELETE', path, handler);
    }

    patch(path: string, handler: Handler): void {
        this.addRoute('PATCH', path, handler);
    }

    private addRoute(method: HttpMethod, path: string, handler: Handler): void {
        const route: Route = { method, path, handler };

        // Convert path to regex for parameter matching
        if (path.includes(':')) {
            const paramNames: string[] = [];
            const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
                paramNames.push(paramName);
                return '([^/]+)';
            });
            route.regex = new RegExp(`^${regexPath}$`);
            route.paramNames = paramNames;
        }

        this.routes.push(route);
    }

    async handle(req: BlazeRequest, res: BlazeResponse): Promise<void> {
        const method = req.method as HttpMethod;
        const pathname = req.url?.split('?')[0] || '/';

        req.path = pathname;
        req.query = this.parseQuery(req.url);

        // Execute middleware first
        let middlewareIndex = 0;

        const runMiddleware = async (): Promise<void> => {
            if (middlewareIndex >= this.middleware.length) {
                return this.executeRoute(req, res, method, pathname);
            }

            const middleware = this.middleware[middlewareIndex++];

            return new Promise((resolve, reject) => {
                const next: NextFunction = (err?: any) => {
                    if (err) return reject(err);
                    runMiddleware().then(resolve).catch(reject);
                };

                try {
                    middleware(req, res, next);
                } catch (err) {
                    reject(err);
                }
            });
        };

        try {
            await runMiddleware();
        } catch (err) {
            this.handleError(err, req, res);
        }
    }

    private async executeRoute(req: BlazeRequest, res: BlazeResponse, method: HttpMethod, pathname: string): Promise<void> {
        // Find matching route
        for (const route of this.routes) {
            if (route.method !== method) continue;

            let isMatch = false;
            const params: Record<string, string> = {};

            if (route.regex && route.paramNames) {
                const match = pathname.match(route.regex);
                if (match) {
                    isMatch = true;
                    route.paramNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                }
            } else if (route.path === pathname) {
                isMatch = true;
            }

            if (isMatch) {
                req.params = params;

                return new Promise<void>((resolve, reject) => {
                    const next: NextFunction = (err?: any) => {
                        if (err) return reject(err);
                        resolve();
                    };

                    try {
                        route.handler(req, res, next);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        }

        // 404 - Not found
        res.status(404).send('Not Found');
    }

    private parseQuery(url?: string): Record<string, string> {
        if (!url) return {};

        const queryString = url.split('?')[1];
        if (!queryString) return {};

        const params: Record<string, string> = {};
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });

        return params;
    }

    private handleError(err: any, req: BlazeRequest, res: BlazeResponse): void {
        console.error('Router Error:', err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }

    getRoutes(): Route[] {
        return [...this.routes];
    }
}