# @bearnjs/rest

A fast and lightweight HTTP framework built from scratch in TypeScript.

## Installation

```bash
npm install @bearnjs/rest
# or
yarn add @bearnjs/rest
# or
pnpm add @bearnjs/rest
```

## Quick Start

```typescript
import createApp from '@bearnjs/rest';

const app = createApp({
  port: 3000,
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.start();
```

## Features

- TypeScript first
- Decorator-based routing
- Built-in CORS support
- Request/response enhancement
- Error handling
- Middleware support
- Lightweight and fast

## Basic Usage

### Creating an App

```typescript
import createApp from '@bearnjs/rest';

const app = createApp({
  port: 3000,
  host: 'localhost',
  appName: 'My API',
  appVersion: '1.0.0',
});
```

### Routes

```typescript
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/users', (req, res) => {
  const user = req.body;
  res.status(201).json({ user });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id });
});
```

### Middleware

```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Decorator-based Controllers

```typescript
import { Controller, Get, Post, Put, Delete } from '@bearnjs/rest';
import type { Request, Response } from '@bearnjs/rest';

@Controller('/users')
class UserController {
  @Get('/')
  getAllUsers(req: Request, res: Response) {
    res.json({ users: [] });
  }

  @Get('/:id')
  getUserById(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ id });
  }

  @Post('/')
  createUser(req: Request, res: Response) {
    const user = req.body;
    res.status(201).json({ user });
  }

  @Put('/:id')
  updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    res.json({ id, updates });
  }

  @Delete('/:id')
  deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    res.status(204).send();
  }
}

// Controllers are automatically registered when the app starts
app.start();
```

### Error Handling

```typescript
app.onError((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});
```

## Requirements

- Node.js >= 20.0.0

## License

MIT
