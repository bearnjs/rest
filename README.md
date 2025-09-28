# @bearnjs/rest

A fast and lightweight HTTP framework built from scratch in TypeScript. Designed for high performance, type safety, and extensibility, providing a modern approach to building HTTP APIs.

![npm version](https://img.shields.io/npm/v/@bearnjs/rest)
![Release Workflow](https://github.com/bearnjs/rest/actions/workflows/release.yml/badge.svg)
![npm downloads](https://img.shields.io/npm/dw/@bearnjs/rest)
![license](https://img.shields.io/npm/l/@bearnjs/rest)
![Node](https://img.shields.io/node/v/@bearnjs/rest)

---

## Features

- TypeScript-first design with strong typing and autocomplete
- Decorator-based routing for clean controller structure
- Built-in CORS support
- Enhanced request and response objects
- Centralized error handling
- Middleware support
- Lightweight and fast

---

## Installation

Install with your preferred package manager:

```bash
npm install @bearnjs/rest
# or
yarn add @bearnjs/rest
# or
pnpm add @bearnjs/rest
```

---

## Quick Start

Create a simple server and define routes:

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

---

## App Configuration

```typescript
import createApp from '@bearnjs/rest';

const app = createApp({
  port: 3000,
  host: 'localhost',
  appName: 'My API',
  appVersion: '1.0.0',
});
```

---

## Decorator-based Controllers

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

app.start();
```

---

## Middleware Example

```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

---

## Error Handling

```typescript
app.onError((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

---

## Requirements

- Node.js >= 20.0.0

---

## Contributing

Contributions are welcome! Please refer to the [CONTRIBUTING.md](./.github/CONTRIBUTING.md) guide for contribution guidelines.

---

## License

This project is licensed under the [GPL-3.0 License](https://github.com/bearnjs/rest/blob/main/LICENSE.md).
