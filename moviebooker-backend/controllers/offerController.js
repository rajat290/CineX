const Offer = require('../models/Offer');
const Wallet = require('../models/Wallet');

const listOffers = async (req, res) => {
  try {
    const { city, category } = req.query;
    const now = new Date();

    const query = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    if (city) {
      query.$or = [{ cities: { $size: 0 } }, { cities: new RegExp(city, 'i') }];
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 });
    res.json({ offers });
  } catch (error) {
    console.error('List offers error:', error);
    res.status(500).json({ message: error.message });
  }
};

const validateOffer = async (req, res) => {
  try {
    const { code, amount, city, category } = req.body;

    if (!code || !amount) {
      return res.status(400).json({ message: 'Offer code and amount are required' });
    }

    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or expired' });
    }

    if (offer.cities.length > 0 && city && !offer.cities.some(item => item.toLowerCase() === city.toLowerCase())) {
      return res.status(400).json({ message: 'Offer is not valid in this city' });
    }

    if (offer.categories.length > 0 && category && !offer.categories.includes(category)) {
      return res.status(400).json({ message: 'Offer is not valid for this category' });
    }

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'Offer usage limit reached' });
    }

    const discount = offer.calculateDiscount(Number(amount));

    res.json({
      offer,
      discount,
      payableAmount: Number(amount) - discount
    });
  } catch (error) {
    console.error('Validate offer error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true }
    );

    res.json({ wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listOffers,
  validateOffer,
  getWallet
};
