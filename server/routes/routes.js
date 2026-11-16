const express = require('express');
const router = express.Router();
const { escapeRegex } = require('../utils/regex');
const Route = require('../models/Route');
const { protect, admin } = require('../middleware/auth');

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

// Get all routes (public)
router.get('/', async (req, res) => {
  try {
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
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes (placed before /:slug so /admin/* doesn't conflict with slug)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: 1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admin/create', protect, admin, async (req, res) => {
  try {
    const payload = normalizeRoutePayload(req.body);
    const route = new Route(payload);
    const saved = await route.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const payload = normalizeRoutePayload(req.body);
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
    const route = await Route.findOne({ slug: req.params.slug, isActive: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
