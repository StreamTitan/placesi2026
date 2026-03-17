const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = 3012;
const JWT_SECRET = 'placesi2026secure';
const DEEPSEEK_KEY = 'sk-0d62fe8519d24766abf2e18e5b4ca6ce';

// PostgreSQL connection pool
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'placesi',
  user: 'postgres',
  password: 'lumina2026',
  max: 20,
  idleTimeoutMillis: 30000,
});

// Middleware
app.use(cors({
  origin: ['http://31.97.150.162:5177', 'http://localhost:5177'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('/root/ai-realty/server/uploads'));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (ms > 500 || req.path.includes('/api/')) {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
    }
  });
  next();
});

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/root/ai-realty/server/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ===================== AUTH MIDDLEWARE =====================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}

// Helper: run query and return rows
async function query(text, params = []) {
  const r = await pool.query(text, params);
  return r.rows;
}

function paginate(q, limit, offset) {
  if (limit) q += ` LIMIT ${parseInt(limit)}`;
  if (offset) q += ` OFFSET ${parseInt(offset)}`;
  return q;
}

// ===================== AUTH ROUTES =====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, role = 'buyer', phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO profiles (id, email, password_hash, full_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email.toLowerCase(), hash, full_name, role, phone]
    );

    const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, email, full_name, role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const rows = await query('SELECT * FROM profiles WHERE email = $1', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    if (user.password_hash) {
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...profile } = user;
    res.json({ token, user: profile });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, email, full_name, phone, avatar_url, role, is_verified, theme_preference, onboarding_completed, created_at FROM profiles WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const fields = [];
    const params = [];
    let i = 1;
    const allowed = ['full_name', 'phone', 'avatar_url', 'theme_preference', 'onboarding_completed'];
    for (const [k, v] of Object.entries(req.body)) {
      if (!allowed.includes(k)) continue;
      params.push(v);
      fields.push(`${k} = $${i++}`);
    }
    if (!fields.length) return res.status(400).json({ error: 'No valid fields' });
    params.push(req.user.id);
    await query(`UPDATE profiles SET ${fields.join(', ')}, updated_at = now() WHERE id = $${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const rows = await query('SELECT password_hash FROM profiles WHERE id = $1', [req.user.id]);
    if (!rows.length || !rows[0].password_hash) return res.status(400).json({ error: 'No password set' });
    const valid = await bcrypt.compare(old_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Wrong password' });
    const hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== PROPERTIES =====================

app.get('/api/properties', async (req, res) => {
  try {
    const { status, property_type, region, city, min_price, max_price, bedrooms, bathrooms, q, limit, offset, sort } = req.query;
    let w = 'WHERE 1=1';
    const p = [];
    let i = 1;
    if (status) { w += ` AND p.status = $${i++}`; p.push(status); }
    if (property_type) { w += ` AND p.property_type = $${i++}`; p.push(property_type); }
    if (region) { w += ` AND p.region ILIKE $${i++}`; p.push(`%${region}%`); }
    if (city) { w += ` AND p.city ILIKE $${i++}`; p.push(`%${city}%`); }
    if (min_price) { w += ` AND p.price >= $${i++}`; p.push(min_price); }
    if (max_price) { w += ` AND p.price <= $${i++}`; p.push(max_price); }
    if (bedrooms) { w += ` AND p.bedrooms >= $${i++}`; p.push(bedrooms); }
    if (bathrooms) { w += ` AND p.bathrooms >= $${i++}`; p.push(bathrooms); }
    if (q) { w += ` AND (p.title ILIKE $${i++} OR p.description ILIKE $${i++} OR p.city ILIKE $${i++})`; const sq = `%${q}%`; p.push(sq, sq, sq); }

    let sql = `SELECT p.*, 
      ag.name as agency_name, ag.logo_url as agency_logo,
      ap.full_name as agent_name, ap.phone as agent_phone
      FROM properties p
      LEFT JOIN agencies ag ON p.agency_id = ag.id
      LEFT JOIN profiles ap ON p.listed_by = ap.id
      ${w}`;

    if (sort === 'price_asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY p.price DESC';
    else if (sort === 'newest') sql += ' ORDER BY p.created_at DESC';
    else sql += ' ORDER BY p.created_at DESC';

    sql = paginate(sql, limit, offset);

    const rows = await query(sql, p);
    // Attach images separately
    for (const row of rows) {
      const imgs = await query('SELECT id, image_url, thumbnail_url, caption, display_order FROM property_images WHERE property_id = $1 ORDER BY display_order', [row.id]);
      row.images = imgs;
    }
    const countRows = await query(`SELECT count(*) FROM properties p ${w}`, p);
    res.json({ data: rows, total: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.*,
        ag.name as agency_name, ag.logo_url as agency_logo, ag.phone as agency_phone,
        ap.full_name as agent_name, ap.phone as agent_phone, ap.avatar_url as agent_avatar
       FROM properties p
       LEFT JOIN agencies ag ON p.agency_id = ag.id
       LEFT JOIN profiles ap ON p.listed_by = ap.id
       WHERE p.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Property not found' });
    const prop = rows[0];
    const imgs = await query('SELECT id, image_url, thumbnail_url, caption, display_order FROM property_images WHERE property_id = $1 ORDER BY display_order', [req.params.id]);
    prop.images = imgs;
    res.json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties', authMiddleware, roleMiddleware('agent', 'agency', 'admin'), async (req, res) => {
  try {
    const {
      title, description, price, property_type, bedrooms, bathrooms, size_sqft,
      lot_size_sqft, address, city, region, country, postal_code, latitude, longitude,
      amenities, features, year_built, agency_id, virtual_tour_url
    } = req.body;

    const id = crypto.randomUUID();
    const { rows } = await query(
      `INSERT INTO properties (id, title, description, price, property_type, bedrooms, bathrooms, size_sqft, lot_size_sqft, address, city, region, country, postal_code, latitude, longitude, amenities, features, year_built, listed_by, agency_id, virtual_tour_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [id, title, description, price, property_type, bedrooms || 0, bathrooms || 0, size_sqft, lot_size_sqft,
        address, city, region, country || 'Trinidad & Tobago', postal_code, latitude, longitude,
        JSON.stringify(amenities || []), JSON.stringify(features || []), year_built, req.user.id, agency_id, virtual_tour_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/properties/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    if (existing[0].listed_by !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });

    const fields = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body)) {
      if (k === 'id') continue;
      params.push(Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v);
      fields.push(`${k} = $${i++}`);
    }
    params.push(req.params.id);
    await query(`UPDATE properties SET ${fields.join(', ')}, updated_at = now() WHERE id = $${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/properties/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    if (existing[0].listed_by !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    await query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties/:id/views', async (req, res) => {
  try {
    await query('UPDATE properties SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties/:id/inquiries', authMiddleware, async (req, res) => {
  try {
    const { message, name, email, phone } = req.body;
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO property_inquiries (id, property_id, user_id, message, contact_name, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, req.params.id, req.user.id, message, name, email, phone]
    );
    await query('UPDATE properties SET inquiry_count = inquiry_count + 1 WHERE id = $1', [req.params.id]);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties/:id/inquiries', authMiddleware, async (req, res) => {
  try {
    const prop = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!prop.length || (prop[0].listed_by !== req.user.id && req.user.role !== 'admin'))
      return res.status(403).json({ error: 'Not authorized' });
    const rows = await query(
      'SELECT i.*, p.full_name as user_name FROM property_inquiries i LEFT JOIN profiles p ON i.user_id = p.id WHERE i.property_id = $1 ORDER BY i.created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/properties/:id/images', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM property_images WHERE property_id = $1 ORDER BY display_order', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties/:id/images', authMiddleware, async (req, res) => {
  try {
    const prop = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!prop.length || (prop[0].listed_by !== req.user.id && req.user.role !== 'admin'))
      return res.status(403).json({ error: 'Not authorized' });
    const { image_url, thumbnail_url, caption, display_order } = req.body;
    const { rows } = await query(
      'INSERT INTO property_images (property_id, image_url, thumbnail_url, caption, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, image_url, thumbnail_url, caption, display_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/properties/:id/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const prop = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!prop.length || (prop[0].listed_by !== req.user.id && req.user.role !== 'admin'))
      return res.status(403).json({ error: 'Not authorized' });
    await query('DELETE FROM property_images WHERE id = $1 AND property_id = $2', [req.params.imageId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== SEARCH =====================

app.get('/api/search', async (req, res) => {
  try {
    const { q, status, property_type, region, city, min_price, max_price, bedrooms, bathrooms, sort, limit, offset } = req.query;
    let w = 'WHERE p.status = \'active\'';
    const p = [];
    let i = 1;
    if (q) { w += ` AND (p.title ILIKE $${i++} OR p.description ILIKE $${i++} OR p.city ILIKE $${i++} OR p.region ILIKE $${i++})`; const sq = `%${q}%`; p.push(sq, sq, sq, sq); }
    if (property_type) { w += ` AND p.property_type = $${i++}`; p.push(property_type); }
    if (region) { w += ` AND p.region ILIKE $${i++}`; p.push(`%${region}%`); }
    if (city) { w += ` AND p.city ILIKE $${i++}`; p.push(`%${city}%`); }
    if (min_price) { w += ` AND p.price >= $${i++}`; p.push(min_price); }
    if (max_price) { w += ` AND p.price <= $${i++}`; p.push(max_price); }
    if (bedrooms) { w += ` AND p.bedrooms >= $${i++}`; p.push(bedrooms); }
    if (bathrooms) { w += ` AND p.bathrooms >= $${i++}`; p.push(bathrooms); }

    let sql = `SELECT p.*, 
      ag.name as agency_name
      FROM properties p LEFT JOIN agencies ag ON p.agency_id = ag.id ${w}`;

    if (sort === 'price_asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY p.price DESC';
    else sql += ' ORDER BY p.created_at DESC';

    sql = paginate(sql, limit, offset);
    const rows = await query(sql, p);
    for (const row of rows) {
      const imgs = await query('SELECT id, image_url, thumbnail_url, caption FROM property_images WHERE property_id = $1 ORDER BY display_order', [row.id]);
      row.images = imgs;
    }
    const countRows = await query(`SELECT count(*) FROM properties p ${w}`, p);
    res.json({ data: rows, total: parseInt(countRows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ cities: [], regions: [], types: [] });
    const sq = `%${q}%`;
    const cities = await query('SELECT DISTINCT city FROM properties WHERE city ILIKE $1 LIMIT 5', [sq]);
    const regions = await query('SELECT DISTINCT region FROM properties WHERE region ILIKE $1 LIMIT 5', [sq]);
    const types = await query('SELECT DISTINCT property_type FROM properties WHERE property_type ILIKE $1 LIMIT 5', [sq]);
    res.json({
      cities: cities.map(r => r.city),
      regions: regions.map(r => r.region),
      types: types.map(r => r.property_type),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/search/analytics', optionalAuth, async (req, res) => {
  try {
    const { query: searchQuery, filters, results_count } = req.body;
    await query(
      'INSERT INTO search_analytics (user_id, search_query, filters, results_count) VALUES ($1, $2, $3, $4)',
      [req.user?.id || null, searchQuery, JSON.stringify(filters || {}), results_count || 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== FAVORITES =====================

app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const rows = await query(
      `SELECT f.created_at, p.*
       FROM favorites f JOIN properties p ON f.property_id = p.id
       WHERE f.user_id = $1 ORDER BY f.created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const { property_id } = req.body;
    const existing = await query('SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2', [req.user.id, property_id]);
    if (existing.length) return res.json({ success: true });
    await query('INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)', [req.user.id, property_id]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites/:propertyId', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM favorites WHERE user_id = $1 AND property_id = $2', [req.user.id, req.params.propertyId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/favorites/check/:propertyId', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2', [req.user.id, req.params.propertyId]);
    res.json({ is_favorited: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== AGENTS =====================

app.get('/api/agents', async (req, res) => {
  try {
    const { verified, agency_id, region, limit, offset } = req.query;
    let w = 'FROM agent_profiles ap JOIN profiles p ON ap.user_id = p.id LEFT JOIN agencies a ON ap.agency_id = a.id WHERE 1=1';
    const p = [];
    let i = 1;
    if (verified === 'true') { w += ` AND ap.is_verified = true`; }
    if (agency_id) { w += ` AND ap.agency_id = $${i++}`; p.push(agency_id); }
    const rows = await query(`SELECT p.id, p.full_name, p.phone, p.avatar_url, p.is_verified, ap.*, a.name as agency_name ${w} ORDER BY ap.is_verified DESC`, p);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.id, p.full_name, p.phone, p.avatar_url, p.is_verified, p.created_at, ap.*,
        a.name as agency_name, a.logo_url as agency_logo
       FROM agent_profiles ap JOIN profiles p ON ap.user_id = p.id
       LEFT JOIN agencies a ON ap.agency_id = a.id
       WHERE p.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Agent not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/slug/:slug', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.id, p.full_name, p.phone, p.avatar_url, ap.*,
        a.name as agency_name
       FROM agent_profiles ap JOIN profiles p ON ap.user_id = p.id
       LEFT JOIN agencies a ON ap.agency_id = a.id
       WHERE ap.license_number = $1`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Agent not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agents/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    const fields = [];
    const params = [];
    let i = 1;
    const apFields = ['agency_id', 'bio', 'years_experience', 'specializations', 'license_number'];
    const pFields = ['full_name', 'phone', 'avatar_url'];
    let apSet = [], pSet = [];
    for (const [k, v] of Object.entries(req.body)) {
      if (apFields.includes(k)) { params.push(Array.isArray(v) ? v : v); apSet.push(`${k} = $${i++}`); }
      if (pFields.includes(k)) { params.push(v); pSet.push(`${k} = $${i++}`); }
    }
    params.push(req.params.id);
    if (apSet.length) await query(`UPDATE agent_profiles SET ${apSet.join(', ')} WHERE user_id = $${i}`, params);
    if (pSet.length) await query(`UPDATE profiles SET ${pSet.join(', ')}, updated_at = now() WHERE id = $${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents/:id/properties', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    let sql = `SELECT * FROM properties WHERE listed_by = $1 AND status = 'active' ORDER BY created_at DESC`;
    sql = paginate(sql, limit, offset);
    const rows = await query(sql, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/contact', optionalAuth, async (req, res) => {
  try {
    const { type = 'profile_view' } = req.body || {};
    // Track contact in analytics or just increment
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const existing = await query('SELECT user_id FROM agent_favorites WHERE user_id = $1 AND agent_id = $2', [req.user.id, req.params.id]);
    if (existing.length) {
      await query('DELETE FROM agent_favorites WHERE user_id = $1 AND agent_id = $2', [req.user.id, req.params.id]);
      res.json({ favorited: false });
    } else {
      await query('INSERT INTO agent_favorites (user_id, agent_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== AGENCIES =====================

app.get('/api/agencies', async (req, res) => {
  try {
    const rows = await query('SELECT a.*, (SELECT count(*) FROM agent_profiles WHERE agency_id = a.id) as agent_count FROM agencies a ORDER BY a.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agencies/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT a.*, (SELECT count(*) FROM agent_profiles WHERE agency_id = a.id) as agent_count,
        (SELECT count(*) FROM properties WHERE agency_id = a.id) as property_count
       FROM agencies a WHERE a.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Agency not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agencies', authMiddleware, roleMiddleware('agency', 'admin'), async (req, res) => {
  try {
    const { name, registration_number, email, phone, address, logo_url, description } = req.body;
    const { rows } = await query(
      `INSERT INTO agencies (name, registration_number, email, phone, address, logo_url, description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, registration_number, email, phone, address, logo_url, description, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/agencies/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      const agency = await query('SELECT created_by FROM agencies WHERE id = $1', [req.params.id]);
      if (!agency.length || agency[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    }
    const fields = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body)) {
      if (k === 'id') continue;
      params.push(v);
      fields.push(`${k} = $${i++}`);
    }
    params.push(req.params.id);
    await query(`UPDATE agencies SET ${fields.join(', ')} WHERE id = $${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agencies/:id/agents', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.id, p.full_name, p.phone, p.avatar_url, ap.* FROM agent_profiles ap
       JOIN profiles p ON ap.user_id = p.id WHERE ap.agency_id = $1`, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agencies/:id/properties', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    let sql = `SELECT * FROM properties WHERE agency_id = $1 AND status = 'active' ORDER BY created_at DESC`;
    sql = paginate(sql, limit, offset);
    const rows = await query(sql, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agencies/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const existing = await query('SELECT user_id FROM agency_favorites WHERE user_id = $1 AND agency_id = $2', [req.user.id, req.params.id]);
    if (existing.length) {
      await query('DELETE FROM agency_favorites WHERE user_id = $1 AND agency_id = $2', [req.user.id, req.params.id]);
      res.json({ favorited: false });
    } else {
      await query('INSERT INTO agency_favorites (user_id, agency_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CONTRACTORS =====================

app.get('/api/contractors', async (req, res) => {
  try {
    const { category, region, verified, limit, offset } = req.query;
    let w = 'WHERE 1=1';
    const p = [];
    let i = 1;
    if (category) { w += ` AND c.category = $${i++}`; p.push(category); }
    if (region) { w += ` AND c.region ILIKE $${i++}`; p.push(`%${region}%`); }
    if (verified === 'true') { w += ' AND c.is_verified = true'; }
    let sql = `SELECT c.*, p.full_name, p.phone, p.avatar_url FROM contractors c JOIN profiles p ON c.user_id = p.id ${w} ORDER BY c.is_verified DESC`;
    sql = paginate(sql, limit, offset);
    const rows = await query(sql, p);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contractors/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.*, p.full_name, p.phone, p.avatar_url FROM contractors c JOIN profiles p ON c.user_id = p.id WHERE c.user_id = $1`,
      [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Contractor not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contractors', authMiddleware, async (req, res) => {
  try {
    const { business_name, category, description, region, city, address, phone, website, license_number } = req.body;
    const { rows } = await query(
      `INSERT INTO contractors (user_id, business_name, category, description, region, city, address, phone, website, license_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, business_name, category, description, region, city, address, phone, website, license_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contractors/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    const fields = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body)) {
      if (k === 'user_id') continue;
      params.push(v);
      fields.push(`${k} = $${i++}`);
    }
    params.push(req.params.id);
    await query(`UPDATE contractors SET ${fields.join(', ')} WHERE user_id = $${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contractors/:id/contact', async (req, res) => {
  res.json({ success: true });
});

app.get('/api/contractors/:id/specials', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM contractor_specials WHERE contractor_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contractors/:id/specials', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized' });
    const { title, description, discount_percentage, start_date, end_date } = req.body;
    const { rows } = await query(
      `INSERT INTO contractor_specials (contractor_id, title, description, discount_percentage, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, title, description, discount_percentage, start_date, end_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== MORTGAGE =====================

app.post('/api/mortgage/apply', authMiddleware, async (req, res) => {
  try {
    const { institution_id, property_id, loan_amount, term_months, purpose, employment_status, monthly_income, monthly_debts, employer_name, employer_contact } = req.body;
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO mortgage_applications (id, user_id, institution_id, property_id, loan_amount, term_months, purpose, employment_status, monthly_income, monthly_debts, employer_name, employer_contact, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, req.user.id, institution_id, property_id, loan_amount, term_months, purpose, employment_status, monthly_income, monthly_debts, employer_name, employer_contact, 'submitted']
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mortgage/applications', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM mortgage_applications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mortgage/applications/:id', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM mortgage_applications WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'bank_partner')
      return res.status(403).json({ error: 'Not authorized' });
    const docs = await query('SELECT * FROM application_documents WHERE application_id = $1', [req.params.id]);
    res.json({ ...rows[0], documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mortgage/applications/:id/documents', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { document_type, description } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const { rows } = await query(
      'INSERT INTO application_documents (application_id, document_type, file_url, description) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, document_type, fileUrl, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mortgage/applications/:id/documents', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM application_documents WHERE application_id = $1', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mortgage/applications/:id/status', authMiddleware, roleMiddleware('bank_partner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    await query('UPDATE mortgage_applications SET status = $1, updated_at = now() WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mortgage/calculate', async (req, res) => {
  try {
    const { loan_amount, annual_rate, term_months, monthly_income, monthly_debts } = req.body;
    const r = annual_rate / 100 / 12;
    const n = term_months;
    const monthly = loan_amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const dsr = monthly_income > 0 ? (monthly + monthly_debts) / monthly_income : 0;
    const maxDsr = 0.40;
    res.json({
      monthly_payment: Math.round(monthly * 100) / 100,
      dsr: Math.round(dsr * 10000) / 100,
      dsr_percentage: `${Math.round(dsr * 100)}%`,
      qualifies: dsr <= maxDsr,
      total_payment: Math.round(monthly * n * 100) / 100,
      total_interest: Math.round((monthly * n - loan_amount) * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mortgage/parameters', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM mortgage_calculation_parameters ORDER BY updated_at DESC LIMIT 1');
    if (rows.length) {
      const { id, institution_id, updated_at, ...params } = rows[0];
      res.json(params);
    } else {
      res.json({ max_dsr_ratio: 0.40, base_rate: 0.065, max_term_years: 30, min_down_payment_percent: 0.10 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CHAT / AI =====================

app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const sid = session_id || crypto.randomUUID();

    // Save user message
    await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)', [sid, 'user', message]);

    // Get recent history
    const history = await query(
      'SELECT role, content FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 20',
      [sid]
    );
    const messages = history.reverse().map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

    messages.push({ role: 'user', content: message });

    // Call DeepSeek
    const systemPrompt = `You are a helpful real estate assistant for Placesi, a property platform in Trinidad & Tobago. Help users find properties, understand mortgage options, and navigate the platform. Be concise and helpful.`;

    const reqBody = JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiRes = await new Promise((resolve, reject) => {
      const postReq = https.request('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_KEY}`,
        },
      }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { reject(new Error('Failed to parse AI response')); }
        });
      });
      postReq.on('error', reject);
      postReq.write(reqBody);
      postReq.end();
    });

    const reply = aiRes.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Save assistant message
    await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)', [sid, 'assistant', reply]);

    // Ensure conversation exists for user
    if (req.user) {
      const exists = await query('SELECT id FROM chat_conversations WHERE id = $1', [sid]);
      if (!exists.length) {
        await query('INSERT INTO chat_conversations (id, user_id, title) VALUES ($1, $2, $3)', [sid, req.user.id, message.slice(0, 50)]);
      }
    }

    res.json({ session_id: sid, reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/:sessionId', optionalAuth, async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [req.params.sessionId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/sessions', authMiddleware, async (req, res) => {
  try {
    const rows = await query(
      'SELECT c.*, (SELECT count(*) FROM chat_messages WHERE conversation_id = c.id) as message_count FROM chat_conversations c WHERE c.user_id = $1 ORDER BY c.updated_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CONTACT REQUESTS =====================

app.post('/api/contact', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, message, property_id, agent_id, subject } = req.body;
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO contact_requests (id, user_id, name, email, phone, message, property_id, agent_id, subject)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, req.user?.id || null, name, email || req.user?.email, phone, message, property_id, agent_id, subject]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contact', authMiddleware, roleMiddleware('agent', 'admin'), async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    let sql = 'SELECT * FROM contact_requests';
    const p = [];
    let i = 1;
    if (status) { sql += ` WHERE status = $${i++}`; p.push(status); }
    sql += ' ORDER BY created_at DESC';
    sql = paginate(sql, limit, offset);
    const rows = await query(sql, p);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== ANALYTICS =====================

app.get('/api/analytics/dashboard', authMiddleware, async (req, res) => {
  try {
    let data = {};
    if (req.user.role === 'admin') {
      const [props, users, agents, inquiries] = await Promise.all([
        query('SELECT count(*) FROM properties WHERE status = \'active\''),
        query('SELECT count(*) FROM profiles'),
        query('SELECT count(*) FROM agent_profiles WHERE is_verified = true'),
        query('SELECT count(*) FROM property_inquiries'),
      ]);
      data = {
        active_properties: parseInt(props[0].count),
        total_users: parseInt(users[0].count),
        verified_agents: parseInt(agents[0].count),
        total_inquiries: parseInt(inquiries[0].count),
      };
    } else if (req.user.role === 'agent') {
      const [props, inquiries, views] = await Promise.all([
        query('SELECT count(*) FROM properties WHERE listed_by = $1 AND status = \'active\'', [req.user.id]),
        query('SELECT count(*) FROM property_inquiries i JOIN properties p ON i.property_id = p.id WHERE p.listed_by = $1', [req.user.id]),
        query('SELECT COALESCE(SUM(view_count), 0) as views FROM properties WHERE listed_by = $1', [req.user.id]),
      ]);
      data = {
        my_properties: parseInt(props[0].count),
        my_inquiries: parseInt(inquiries[0].count),
        total_views: parseInt(views[0].views),
      };
    } else {
      const [favs, inquiries] = await Promise.all([
        query('SELECT count(*) FROM favorites WHERE user_id = $1', [req.user.id]),
        query('SELECT count(*) FROM property_inquiries WHERE user_id = $1', [req.user.id]),
      ]);
      data = { favorites: parseInt(favs[0].count), my_inquiries: parseInt(inquiries[0].count) };
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics/property/:id', authMiddleware, async (req, res) => {
  try {
    const prop = await query('SELECT listed_by FROM properties WHERE id = $1', [req.params.id]);
    if (!prop.length || (prop[0].listed_by !== req.user.id && req.user.role !== 'admin'))
      return res.status(403).json({ error: 'Not authorized' });

    const [views, inquiries, recent] = await Promise.all([
      query('SELECT view_count, inquiry_count, created_at FROM properties WHERE id = $1', [req.params.id]),
      query('SELECT count(*) FROM property_inquiries WHERE property_id = $1', [req.params.id]),
      query('SELECT * FROM property_inquiries WHERE property_id = $1 ORDER BY created_at DESC LIMIT 5', [req.params.id]),
    ]);
    res.json({
      view_count: views[0].view_count,
      inquiry_count: views[0].inquiry_count,
      listed_at: views[0].created_at,
      recent_inquiries: recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== UPLOAD =====================

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// ===================== GENERIC DB CRUD =====================

app.get('/api/db/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { select, order, limit, offset, ...filters } = req.query;

    // Basic SQL injection prevention - only allow alphanumeric table names
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

    const selectStr = select ? select.split(',').map(s => {
      if (!/^[a-zA-Z_*][a-zA-Z0-9_.]*$/.test(s.trim())) return null;
      return s.trim();
    }).filter(Boolean).join(', ') : '*';

    let w = '';
    const p = [];
    let i = 1;
    for (const [k, v] of Object.entries(filters)) {
      if (k.startsWith('_') || ['select', 'order', 'limit', 'offset'].includes(k)) continue;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) continue;
      w += ` AND ${k} = $${i++}`;
      p.push(v);
    }

    let sql = `SELECT ${selectStr} FROM ${table} WHERE 1=1${w}`;
    if (order && /^[a-zA-Z_][a-zA-Z0-9_]*(\.(asc|desc))?$/i.test(order)) {
      sql += ` ORDER BY ${order.replace(/\.(asc|desc)$/i, ' $1')}`;
    }
    sql = paginate(sql, limit, offset);
    const rows = await query(sql, p);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

    const cols = [];
    const vals = [];
    const p = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body)) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) continue;
      cols.push(k);
      vals.push(`$${i++}`);
      p.push(typeof v === 'object' ? JSON.stringify(v) : v);
    }
    if (!cols.length) return res.status(400).json({ error: 'No fields provided' });

    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`;
    const rows = await query(sql, p);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/db/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

    // Parse ?id=eq.val from query
    const { id, ...updates } = { ...req.query, ...req.body };
    if (!id) return res.status(400).json({ error: 'id parameter required (use ?id=eq.value or body)' });

    const fields = [];
    const p = [];
    let i = 1;
    const bodyUpdates = req.body;
    for (const [k, v] of Object.entries(bodyUpdates)) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) continue;
      fields.push(`${k} = $${i++}`);
      p.push(typeof v === 'object' ? JSON.stringify(v) : v);
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    p.push(id);
    await query(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${i}`, p);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/db/:table', authMiddleware, async (req, res) => {
  try {
    const { table } = req.params;
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id parameter required' });
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });

    await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== HEALTH CHECK =====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===================== START SERVER =====================

app.listen(PORT, () => {
  console.log(`🏢 Placesi API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth/`);
  console.log(`   Props:  http://localhost:${PORT}/api/properties`);
});

// Graceful shutdown
process.on('SIGTERM', () => { pool.end(); process.exit(0); });
process.on('SIGINT', () => { pool.end(); process.exit(0); });
