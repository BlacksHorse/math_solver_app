import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();

// CORS + allow embedding inside AppCreator24
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-User-Id');
  // Allow framing (avoid blocking in iframes)
  res.removeHeader?.('X-Frame-Options');
  next();
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

// Mount API routes
app.use('/api', routes);

// Health
app.get('/', (req, res) => res.send('Mathify API running'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Mathify API on http://localhost:${PORT}`));
