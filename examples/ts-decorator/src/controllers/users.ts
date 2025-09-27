import { Controller, Post, Get, Request, Response, validate } from '@bearnjs/rest';
import { z } from 'zod';

@Controller('/users')
class UsersController {

    private users = <{ id: number, name: string }[]>[
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
        { id: 3, name: 'John Smith' },
        { id: 4, name: 'Jane Smith' }
    ];

    @Post({
        path: '/',
        middlewares: [validate({
            body: z.object({ name: z.string() })
        })]
    })
    async createUser(
        req: Request<{}, {}, { name: string }>,
        res: Response
    ) {
        const { name } = req.body!;

        this.users.push({ id: this.users.length + 1, name });

        return res.json({ id: this.users.length + 1, name });
    }

    @Get({
        path: '/',
        middlewares: [validate({
            query: z.object({
                limit: z.number().default(5),
                page: z.number().default(1)
            }),
        })]
    })
    async getUsers(
        req: Request<{}, { limit: string, page: string }, {}>,
        res: Response
    ) {
        try {
            const { limit = '10', page = '1' } = req.query;
            const limitNum = Number(limit);
            const pageNum = Number(page);

            if (isNaN(limitNum) || isNaN(pageNum) || pageNum < 1 || limitNum < 1) {
                return res.status(400).json({ error: 'Invalid page or limit parameters' });
            }

            const start = (pageNum - 1) * limitNum;
            const end = start + limitNum;

            res.json({
                users: this.users.slice(start, end),
                total: this.users.length,
                page: pageNum,
                limit: limitNum
            });
        } catch (e) {
            return res.status(500).json({ error: 'Internal server error' as string });
        }
    }
}

