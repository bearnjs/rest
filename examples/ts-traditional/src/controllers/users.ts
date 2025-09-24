import { Request, Response } from '@bearn/rest';

let users = <{ id: string, name: string }[]>[
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'John Smith' },
    { id: '4', name: 'Jane Smith' }
];

export async function createUser(
    req: Request<{ id: string }, {}, { name: string }>,
    res: Response
) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        users.push({ id, name });

        res.json({ id, name });
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getUsers(
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
            users: users.slice(start, end),
            total: users.length,
            page: pageNum,
            limit: limitNum
        });
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
