import { Blaze } from "./blaze";


const app = new Blaze();


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


app.get('/', (req, res) => {
    res.json({ message: 'Hello from Blaze!', timestamp: Date.now() });
});

app.get('/users/:id', (req, res) => {
    res.json({
        userId: req.params?.id,
        query: req.query,
        path: req.path
    });
});

app.post('/users', (req, res) => {
    res.json({
        message: 'User created',
        body: req.body,
        timestamp: Date.now()
    });
});

app.get('/redirect', (req, res) => {
    res.redirect('/');
});


app.onError((err, req, res, next) => {
    console.error('Custom error handler:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(3000, () => {
    console.log(' server running on http://localhost:3000');
    console.log('Available routes:');
    console.log('  GET  / - Hello message');
    console.log('  GET  /users/:id - Get user by ID');
    console.log('  POST /users - Create user');
    console.log('  GET  /redirect - Redirect to home');
});


process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    app.close();
});