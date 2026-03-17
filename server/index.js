import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = 'sk-0d62fe8519d24766abf2e18e5b4ca6ce';

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'lumina2026',
  database: 'placesi',
  port: 5432
});

// Helper functions
const generateId = () => crypto.randomUUID();
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Initialize database
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'owner',
        agency_id UUID,
        token VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        detailed_description TEXT,
        price VARCHAR(100),
        price_num INTEGER,
        location VARCHAR(500),
        location_type VARCHAR(50),
        listing_type VARCHAR(50),
        region VARCHAR(100),
        region_description TEXT,
        beds INTEGER,
        baths INTEGER,
        sqft INTEGER,
        lot_size INTEGER,
        parking INTEGER,
        maintenance INTEGER,
        type VARCHAR(50),
        year_built INTEGER,
        image VARCHAR(500),
        images TEXT[],
        features TEXT[],
        amenities TEXT[],
        favorited INTEGER DEFAULT 0,
        listed_date DATE,
        agent_name VARCHAR(255),
        agent_phone VARCHAR(50),
        agent_email VARCHAR(255),
        agent_agency VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS agencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        phone VARCHAR(50),
        website VARCHAR(255),
        logo VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Check if admin exists, if not create one
    const adminCheck = await client.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const adminPassword = hashPassword('PlacesiAdmin2026!');
      const adminToken = generateToken();
      await client.query(`
        INSERT INTO users (email, password_hash, name, role, token)
        VALUES ($1, $2, $3, 'admin', $4)
      `, ['admin@placesi.com', adminPassword, 'Placesi Admin', adminToken]);
      console.log('Admin account created: admin@placesi.com / PlacesiAdmin2026!');
    }
    
    console.log('Database initialized');
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

// Auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

// === AUTH ROUTES ===

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role = 'owner', agencyId } = req.body;
  
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const passwordHash = hashPassword(password);
    const token = generateToken();
    
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, agency_id, token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, role, agency_id
    `, [email, passwordHash, name, role, agencyId || null, token]);
    
    res.json({
      token,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const passwordHash = hashPassword(password);
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const newToken = generateToken();
    await pool.query('UPDATE users SET token = $1 WHERE id = $2', [newToken, result.rows[0].id]);
    
    res.json({
      token: newToken,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        role: result.rows[0].role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// === PROPERTY ROUTES ===

app.post('/api/properties', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      INSERT INTO properties (
        user_id, title, description, price, location, location_type, listing_type,
        region, beds, baths, sqft, type, image, images, features, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'active')
      RETURNING *
    `, [
      req.user.id, req.body.title, req.body.description, req.body.price,
      req.body.location, req.body.locationType, req.body.listingType, req.body.region,
      req.body.beds, req.body.baths, req.body.sqft, req.body.type,
      req.body.image, req.body.images || [], req.body.features || []
    ]);
    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

app.get('/api/properties', async (req, res) => {
  const { location, listingType } = req.query;
  
  try {
    let query = 'SELECT * FROM properties WHERE status = $1';
    const params = ['active'];
    
    if (location && location !== 'all') {
      params.push(location);
      query += ` AND location_type = $${params.length}`;
    }
    if (listingType && listingType !== 'all') {
      params.push(listingType);
      query += ` AND listing_type = $${params.length}`;
    }
    
    const result = await pool.query(query, params);
    res.json({ properties: result.rows });
  } catch (error) {
    console.error('Properties fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// === ADMIN ROUTES ===

app.get('/api/admin/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, agency_id, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// === PROPERTY MANAGEMENT ===

app.delete('/api/properties/:id', auth, async (req, res) => {
  try {
    // Check ownership or admin
    const propCheck = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    
    if (propCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const prop = propCheck.rows[0];
    
    // Allow delete if user owns the property or is admin
    if (prop.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }
    
    await pool.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Property delete error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// === REGIONS ===

app.get('/api/regions', (req, res) => {
  res.json({
    regions: {
      central: { name: 'Central', count: 3552 },
      northEast: { name: 'North East', count: 6579 },
      northWest: { name: 'North West', count: 10459 },
      southEast: { name: 'South East', count: 241 },
      southWest: { name: 'South West', count: 2796 },
      tobago: { name: 'Tobago', count: 589 }
    }
  });
});

// === AI CHAT ===

app.post('/api/chat', async (req, res) => {
  const { messages, filters } = req.body;

  try {
    // Get properties from database based on filters
    let query = 'SELECT * FROM properties WHERE status = $1';
    const params = ['active'];
    
    if (filters?.location && filters.location !== 'all') {
      params.push(filters.location);
      query += ` AND location_type = $${params.length}`;
    }
    if (filters?.listingType && filters.listingType !== 'all') {
      params.push(filters.listingType);
      query += ` AND listing_type = $${params.length}`;
    }
    
    const propsResult = await pool.query(query, params);
    let relevantListings = propsResult.rows;

    // Call DeepSeek for AI response
    const systemPrompt = `You are Placesi, an AI real estate assistant for Trinidad & Tobago. Be helpful and concise.`;
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, I cannot respond right now.';

    res.json({
      message: aiResponse,
      listings: relevantListings.slice(0, 4)
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(PORT, () => {
  console.log(`Placesi API server running on port ${PORT}`);
  console.log('Admin credentials: admin@placesi.com / PlacesiAdmin2026!');
});
