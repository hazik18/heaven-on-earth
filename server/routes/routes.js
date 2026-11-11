const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { escapeRegex } = require('../utils/regex');
const Route = require('../models/Route');
const { protect, admin } = require('../middleware/auth');

const mockPath = path.resolve(__dirname, '../../client/src/data/routes.mock.json');
let inMemoryRoutes = [];
try {
  inMemoryRoutes = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
} catch {
  inMemoryRoutes = [];
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to ensure "approx." prefix on distance, duration, cost
const ensureApprox = (val) => {
  if (!val || typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed) return trimmed;
  return /^approx\./i.test(trimmed) ? trimmed : `approx. ${trimmed}`;
};

const normalizeRoutePayload = (body) => {
  const data = { ...body };
  delete data._id;
  delete data.id;
  if (data.approx_distance) data.approx_distance = ensureApprox(data.approx_distance);
  if (data.approx_duration) data.approx_duration = ensureApprox(data.approx_duration);
  if (data.approx_cost) data.approx_cost = ensureApprox(data.approx_cost);
  if (Array.isArray(data.key_passes)) {
    data.key_passes = data.key_passes.map((p) => ({
      name: p.name,
      altitude: ensureApprox(p.altitude)
    }));
  }
  return data;
};

const filterMockRoutes = (list, query) => {
  const { category, permits, featured, search } = query;
  return list.filter((r) => {
    if (r.isActive === false) return false;
    if (category && r.category !== category) return false;
    if (permits === 'true' && !r.permits_required) return false;
    if (permits === 'false' && r.permits_required) return false;
    if (featured === 'true' && !r.isFeatured) return false;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      const matched =
        regex.test(r.title || '') ||
        regex.test(r.from_location || '') ||
        regex.test(r.to_location || '') ||
        regex.test(r.itinerary_summary || '') ||
        (r.highlights || []).some((h) => regex.test(h));
      if (!matched) return false;
    }
    return true;
  });
};

// Get all routes (public)
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(filterMockRoutes(inMemoryRoutes, req.query));
    }

    const { category, permits, featured, search } = req.query;
    const filter = { isActive: true };

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { title: regex },
        { from_location: regex },
        { to_location: regex },
        { itinerary_summary: regex },
        { highlights: regex }
      ];
    }
    if (category) filter.category = category;
    if (permits === 'true') filter.permits_required = true;
    if (permits === 'false') filter.permits_required = false;
    if (featured === 'true') filter.isFeatured = true;

    const routes = await Route.find(filter).sort({ isFeatured: -1, createdAt: 1 });
    if (routes.length === 0 && !category && !permits && !featured && !search) {
      return res.json(inMemoryRoutes);
    }
    res.json(routes);
  } catch (err) {
    res.json(filterMockRoutes(inMemoryRoutes, req.query));
  }
});

// Admin routes (placed before /:slug so /admin/* doesn't conflict with slug)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(inMemoryRoutes);
    }
    const routes = await Route.find().sort({ createdAt: 1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin/create', protect, admin, async (req, res) => {
  try {
    const payload = normalizeRoutePayload(req.body);
    if (!isDbConnected()) {
      const mockItem = { ...payload, id: `route-${Date.now()}`, _id: `route-${Date.now()}` };
      inMemoryRoutes.push(mockItem);
      return res.status(201).json(mockItem);
    }
    const route = new Route(payload);
    const saved = await route.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/admin/seed', protect, admin, async (req, res) => {
  try {
    const raw = fs.readFileSync(mockPath, 'utf-8');
    const mockRoutes = JSON.parse(raw);

    if (!isDbConnected()) {
      inMemoryRoutes = mockRoutes;
      return res.status(200).json({
        message: `Loaded ${mockRoutes.length} Ladakh routes in local mock store (MongoDB not connected)`,
        count: mockRoutes.length,
        routes: inMemoryRoutes
      });
    }

    const results = [];
    for (const item of mockRoutes) {
      const payload = normalizeRoutePayload(item);
      const doc = await Route.findOneAndUpdate(
        { slug: payload.slug },
        { $set: payload },
        { upsert: true, new: true, runValidators: true }
      );
      results.push(doc);
    }

    res.status(200).json({
      message: `Successfully seeded ${results.length} Ladakh routes into database`,
      count: results.length,
      routes: results
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to seed routes from mock data' });
  }
});

router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const payload = normalizeRoutePayload(req.body);
    if (!isDbConnected()) {
      const idx = inMemoryRoutes.findIndex(
        (r) => (r._id || r.id) === req.params.id || r.slug === payload.slug
      );
      if (idx === -1) return res.status(404).json({ message: 'Route not found' });
      inMemoryRoutes[idx] = { ...inMemoryRoutes[idx], ...payload };
      return res.json(inMemoryRoutes[idx]);
    }
    const route = await Route.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      inMemoryRoutes = inMemoryRoutes.filter((r) => (r._id || r.id) !== req.params.id);
      return res.json({ message: 'Route deleted' });
    }
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single route by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const found = inMemoryRoutes.find((r) => r.slug === req.params.slug && r.isActive !== false);
      if (!found) return res.status(404).json({ message: 'Route not found' });
      return res.json(found);
    }
    const route = await Route.findOne({ slug: req.params.slug, isActive: true });
    if (!route) {
      const fallback = inMemoryRoutes.find(
        (r) => r.slug === req.params.slug && r.isActive !== false
      );
      if (fallback) return res.json(fallback);
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (err) {
    const fallback = inMemoryRoutes.find((r) => r.slug === req.params.slug);
    if (fallback) return res.json(fallback);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
