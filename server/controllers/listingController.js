const Listing = require('../models/Listing');
const fs = require('fs');
const csv = require('csv-parser');
const logActivity = require('../utils/logger');

const createListing = async (req, res) => {
  try {
    const { url, category, price, da, traffic } = req.body;

    const listing = await Listing.create({
      seller: req.user.id, 
      url,
      category,
      price,
      da: da || 0,
      traffic: traffic || 0,
      status: 'pending' 
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { 
      category, search, 
      minDA, maxDA, 
      minTraffic, maxTraffic, 
      minPrice, maxPrice, 
      sort 
    } = req.query;
    
    let query = { status: "approved" };

    if (search) query.url = { $regex: search, $options: 'i' };

    if (category && category !== 'All') query.category = category;

    if (minDA || maxDA) {
      query.da = {};
      if (minDA) query.da.$gte = Number(minDA);
      if (maxDA) query.da.$lte = Number(maxDA);
    }

    if (minTraffic || maxTraffic) {
      query.traffic = {};
      if (minTraffic) query.traffic.$gte = Number(minTraffic);
      if (maxTraffic) query.traffic.$lte = Number(maxTraffic);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'da_desc') sortObj = { da: -1 };
    if (sort === 'traffic_desc') sortObj = { traffic: -1 };

    const listings = await Listing.find(query)
      .populate('seller', 'name') 
      .sort(sortObj);

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      listing.status = "approved";
      const updatedListing = await listing.save();
      await logActivity(req.user.id, "LISTING_APPROVED", listing._id, `Approved site: ${listing.url}`);
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminListings = async (req, res) => {
  try {
    const listings = await Listing.find({})
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const listing = await Listing.findById(req.params.id);

    if (listing) {
      listing.status = status;
      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUploadListings = async (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push({
      seller: req.user.id,
      url: data.url,
      category: data.category || 'General',
      price: Number(data.price),
      da: Number(data.da) || 0,
      traffic: Number(data.traffic) || 0,
      status: 'pending'
    }))
    .on('end', async () => {
      try {
        await Listing.insertMany(results);
        fs.unlinkSync(filePath); // Delete temporary file
        res.status(201).json({ message: `${results.length} listings uploaded successfully!` });
      } catch (error) {
        res.status(500).json({ message: "Error saving bulk data: " + error.message });
      }
    });
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    
    // Calculate quick stats for the seller
    const totalListings = listings.length;
    const approvedListings = listings.filter(l => l.status === 'approved').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;

    res.json({
      listings,
      stats: { totalListings, approvedListings, pendingListings }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check ownership: Only the owner or an admin can edit
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this listing' });
    }

    // Update fields
    listing.price = req.body.price || listing.price;
    listing.category = req.body.category || listing.category;
    listing.da = req.body.da || listing.da;
    listing.traffic = req.body.traffic || listing.traffic;

    // If a seller edits a listing, we set it back to "pending" 
    // so the Admin can verify the new metrics/price.
    if (req.user.role !== 'admin') {
      listing.status = 'pending';
      listing.isVerified = false;
    }

    const updatedListing = await listing.save();
    
    // Log the change
    await logActivity(req.user.id, "LISTING_UPDATED", listing._id, `Updated metrics/price for ${listing.url}`);

    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email');
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getAdminListings,
  updateListingStatus,
  approveListing,
  bulkUploadListings,
  getMyListings,
  updateListing,
  getListingById
};