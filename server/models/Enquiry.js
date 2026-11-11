const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  enquiryType: { 
    type: String, 
    required: true,
    enum: ['package', 'trek', 'activity', 'rental', 'hotel', 'route', 'general']
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'enquiryType'
  },
  travelDate: Date,
  groupSize: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 }
  },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'converted', 'closed'],
    default: 'new'
  },
  notes: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, default: 'website' }
}, { timestamps: true });

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
