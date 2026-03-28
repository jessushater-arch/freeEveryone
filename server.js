const express = require('express');
const cors = require('cors');
const app = express();

// Расширенные настройки CORS — разрешаем запросы с GitHub Pages
app.use(cors({
    origin: [
        'https://jessushater-arch.github.io',
        'http://localhost:3000',
        'http://localhost:8080',
        'https://*.github.io'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Обработка preflight (OPTIONS) запросов
app.options('/api/chat', cors());

app.post('/api/chat', async (req, res) => {
    const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.9 } = req.body;
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: 2048
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Groq API error:', data.error);
            return res.status(400).json({ error: data.error.message });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Groq proxy running on port ${port}`);
    console.log(`Health: http://localhost:${port}/health`);
    console.log(`Chat: POST http://localhost:${port}/api/chat`);
});
