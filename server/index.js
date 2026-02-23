const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const { Profile, User, UserRole, Student, Vehicle, Route, LocationTracking } = require('./models');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schooltrack';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => { console.error('Mongo connection error', err); });

// Ensure uploads exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const bucket = req.body.bucket || 'avatars';
    const dest = path.join(__dirname, 'uploads', bucket);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const p = req.body.path || file.originalname;
    const parts = p.split('/');
    cb(null, parts.slice(-1)[0]);
  }
});
const upload = multer({ storage });

// ─────────────────────────────────────────
// Auth middleware
// ─────────────────────────────────────────
function ensureAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function ensureAdmin(req, res, next) {
  try {
    const role = await UserRole.findOne({ user_id: req.user.id });
    if (!role || role.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin role required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error checking role' });
  }
}

// ─────────────────────────────────────────
// Helper: build Mongoose filter from client filters object
// Supports plain equality AND $in operator
// ─────────────────────────────────────────
function buildMongoFilter(parsedFilters) {
  const filter = {};
  for (const [key, val] of Object.entries(parsedFilters)) {
    if (val && typeof val === 'object' && '$in' in val) {
      // Convert string ids in $in array to ObjectIds where possible
      filter[key] = {
        $in: val.$in.map(v => {
          try { return new mongoose.Types.ObjectId(v); } catch (_) { return v; }
        })
      };
    } else {
      filter[key] = val;
    }
  }
  return filter;
}

// ─────────────────────────────────────────
// Auth routes
// ─────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, metadata } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const profile = new Profile({ email, full_name: metadata?.full_name || null });
    await profile.save();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ email, passwordHash: hash, profile_id: profile._id });
    await user.save();

    const role = new UserRole({ user_id: profile._id, role: 'user' });
    await role.save();

    const token = jwt.sign({ id: profile._id, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: { id: profile._id, email, full_name: profile.full_name },
      session: { token, user: { id: profile._id, email } }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user', err: err.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const [match, profile] = await Promise.all([
      bcrypt.compare(password, user.passwordHash),
      Profile.findById(user.profile_id)
    ]);

    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: profile._id, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: { id: profile._id, email, full_name: profile.full_name },
      session: { token, user: { id: profile._id, email } }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing in', err: err.message });
  }
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/auth/session', ensureAuth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({
      session: {
        user: { id: profile._id, email: profile.email },
        token: (req.headers.authorization || '').split(' ')[1]
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// ─────────────────────────────────────────
// Stats endpoint — returns aggregated counts for admin dashboard
// ─────────────────────────────────────────
app.get('/api/stats', ensureAuth, async (req, res) => {
  try {
    const [students, vehicles, activeVehicles, routes, activeRoutes, locations, drivers, users] = await Promise.all([
      Student.countDocuments(),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'active' }),
      Route.countDocuments(),
      Route.countDocuments({ status: 'active' }),
      LocationTracking.countDocuments(),
      UserRole.countDocuments({ role: 'driver' }),
      Profile.countDocuments(),
    ]);
    res.json({ students, vehicles, activeVehicles, routes, activeRoutes, locations, drivers, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats', err: err.message });
  }
});

// ─────────────────────────────────────────
// Generic collection endpoints — GET/POST/PUT/DELETE
// ─────────────────────────────────────────
app.get('/api/:collection', ensureAuth, async (req, res) => {
  const { collection } = req.params;
  const { filters, order, limit } = req.query;
  try {
    const parsedFilters = filters ? JSON.parse(filters) : {};
    const Model = mapCollectionToModel(collection);
    if (!Model) return res.status(400).json({ message: 'Unknown collection' });

    const mongoFilter = buildMongoFilter(parsedFilters);
    let q = Model.find(mongoFilter);
    if (order) {
      const o = JSON.parse(order);
      q = q.sort({ [o.column]: o.ascending ? 1 : -1 });
    }
    if (limit) q = q.limit(parseInt(limit));
    const docs = await q.exec();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching collection', err: err.message });
  }
});

app.post('/api/:collection', ensureAuth, async (req, res) => {
  const { collection } = req.params;
  try {
    const Model = mapCollectionToModel(collection);
    if (!Model) return res.status(400).json({ message: 'Unknown collection' });
    const payload = req.body;
    const docs = Array.isArray(payload)
      ? await Model.insertMany(payload)
      : await new Model(payload).save();
    res.json(Array.isArray(payload) ? docs : [docs]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error inserting', err: err.message });
  }
});

app.put('/api/:collection', ensureAuth, async (req, res) => {
  const { collection } = req.params;
  try {
    const Model = mapCollectionToModel(collection);
    if (!Model) return res.status(400).json({ message: 'Unknown collection' });
    const payload = req.body;
    // Support id from body OR from query string
    const id = payload.id || req.query.id;
    if (!id) return res.status(400).json({ message: 'Missing id for update' });
    const { id: _id, _id: __id, ...updateFields } = payload;
    const updated = await Model.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: 'Document not found' });
    return res.json([updated]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating', err: err.message });
  }
});

app.delete('/api/:collection', ensureAuth, async (req, res) => {
  const { collection } = req.params;
  try {
    const Model = mapCollectionToModel(collection);
    if (!Model) return res.status(400).json({ message: 'Unknown collection' });

    // Accept id from query string OR from JSON body
    const id = req.query.id || req.body?.id;
    if (!id) return res.status(400).json({ message: 'Missing id for delete' });

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Document not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting', err: err.message });
  }
});

// ─────────────────────────────────────────
// Storage endpoints
// ─────────────────────────────────────────
app.post('/api/storage/upload', ensureAuth, upload.single('file'), (req, res) => {
  const bucket = req.body.bucket || 'avatars';
  const pathParam = req.body.path || req.file.filename;
  res.json({ Key: pathParam, bucket, ok: true });
});

app.post('/api/storage/delete', ensureAuth, (req, res) => {
  const { bucket, paths } = req.body;
  if (!bucket || !paths) return res.status(400).json({ message: 'Missing bucket or paths' });
  try {
    paths.forEach((p) => {
      const full = path.join(__dirname, 'uploads', bucket, p.split('/').slice(-1)[0]);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting files' });
  }
});

// ─────────────────────────────────────────
// Collection → Model mapping
// ─────────────────────────────────────────
function mapCollectionToModel(name) {
  switch (name) {
    case 'profiles': return Profile;
    case 'user_roles': return UserRole;
    case 'students': return Student;
    case 'vehicles': return Vehicle;
    case 'routes': return Route;
    case 'location_tracking': return LocationTracking;
    default: return null;
  }
}

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
