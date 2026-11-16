const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Settings = require('../models/Settings');

// GET /api/settings - public, used by all visitors
router.get('/', async (req, res) => {
  try {
    const doc = await Settings.getSingleton();
    res.json({
      whatsapp: {
        phone: doc.whatsapp?.phone || '',
        template: doc.whatsapp?.template || '',
      },
      contact: {
        contactPhone: doc.contact?.contactPhone || '',
        contactEmail: doc.contact?.contactEmail || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/settings - admin only
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const { whatsapp, contact } = req.body || {};
    const doc = await Settings.getSingleton();

    if (whatsapp && typeof whatsapp === 'object') {
      if (typeof whatsapp.phone === 'string') doc.whatsapp.phone = whatsapp.phone.trim();
      if (typeof whatsapp.template === 'string') doc.whatsapp.template = whatsapp.template;
    }
    if (contact && typeof contact === 'object') {
      if (typeof contact.contactPhone === 'string') doc.contact.contactPhone = contact.contactPhone.trim();
      if (typeof contact.contactEmail === 'string') doc.contact.contactEmail = contact.contactEmail.trim();
    }

    await doc.save();

    res.json({
      whatsapp: {
        phone: doc.whatsapp.phone,
        template: doc.whatsapp.template,
      },
      contact: {
        contactPhone: doc.contact.contactPhone,
        contactEmail: doc.contact.contactEmail,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
