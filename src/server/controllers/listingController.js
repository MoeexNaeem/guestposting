import { Readable } from 'stream';
import csv from 'csv-parser';
import Listing from '../models/Listing';
import User from '../models/User';
import logActivity from '../logger';
import { json, readBody } from '../http';

export const createListing = async (request, params, user) => {
  try {
    const { url, category, price, da, traffic } = await readBody(request);

    const listing = await Listing.create({
      seller: user.id,
      url,
      category,
      price,
      da: da || 0,
      traffic: traffic || 0,
      status: 'pending'
    });

    return json(listing, 201);
  } catch (error) {
    return json({ message: error.message }, 400);
  }
};

export const getListings = async (request) => {
  try {
    const query_ = Object.fromEntries(new URL(request.url).searchParams);
    const {
      category, search,
      minDA, maxDA,
      minTraffic, maxTraffic,
      minPrice, maxPrice,
      sort
    } = query_;

    let query = { status: "approved" };

    // Listings of suspended sellers are hidden from the marketplace.
    const suspendedSellers = await User.find({ isSuspended: true }).distinct('_id');
    if (suspendedSellers.length) query.seller = { $nin: suspendedSellers };

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

    return json(listings);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const approveListing = async (request, params, user) => {
  try {
    const listing = await Listing.findById(params.id);
    if (listing) {
      listing.status = "approved";
      const updatedListing = await listing.save();
      await logActivity(user.id, "LISTING_APPROVED", listing._id, `Approved site: ${listing.url}`);
      return json(updatedListing);
    } else {
      return json({ message: 'Listing not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getAdminListings = async () => {
  try {
    const listings = await Listing.find({})
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    return json(listings, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const updateListingStatus = async (request, params) => {
  try {
    const { status } = await readBody(request);

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return json({ message: 'Invalid status' }, 400);
    }

    const listing = await Listing.findById(params.id);

    if (listing) {
      listing.status = status;
      const updatedListing = await listing.save();
      return json(updatedListing);
    } else {
      return json({ message: 'Listing not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

// Express used multer to write the CSV to uploads/ and stream it back in;
// here the uploaded file is streamed straight from memory into csv-parser.
export const bulkUploadListings = async (request, params, user) => {
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return json({ message: 'No file uploaded' }, 500);
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  const results = [];
  await new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (data) => results.push({
        seller: user.id,
        url: data.url,
        category: data.category || 'General',
        price: Number(data.price),
        da: Number(data.da) || 0,
        traffic: Number(data.traffic) || 0,
        status: 'pending'
      }))
      .on('end', resolve)
      .on('error', reject);
  });

  try {
    await Listing.insertMany(results);
    return json({ message: `${results.length} listings uploaded successfully!` }, 201);
  } catch (error) {
    return json({ message: "Error saving bulk data: " + error.message }, 500);
  }
};

export const getMyListings = async (request, params, user) => {
  try {
    const listings = await Listing.find({ seller: user.id }).sort({ createdAt: -1 });

    // Calculate quick stats for the seller
    const totalListings = listings.length;
    const approvedListings = listings.filter(l => l.status === 'approved').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;

    return json({
      listings,
      stats: { totalListings, approvedListings, pendingListings }
    });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const updateListing = async (request, params, user) => {
  try {
    const listing = await Listing.findById(params.id);

    if (!listing) {
      return json({ message: 'Listing not found' }, 404);
    }

    // Check ownership: Only the owner or an admin can edit
    if (listing.seller.toString() !== user.id && user.role !== 'admin') {
      return json({ message: 'Not authorized to edit this listing' }, 401);
    }

    const body = await readBody(request);

    // Update fields
    listing.price = body.price || listing.price;
    listing.category = body.category || listing.category;
    listing.da = body.da || listing.da;
    listing.traffic = body.traffic || listing.traffic;

    // If a seller edits a listing, we set it back to "pending"
    // so the Admin can verify the new metrics/price.
    if (user.role !== 'admin') {
      listing.status = 'pending';
      listing.isVerified = false;
    }

    const updatedListing = await listing.save();

    // Log the change
    await logActivity(user.id, "LISTING_UPDATED", listing._id, `Updated metrics/price for ${listing.url}`);

    return json(updatedListing);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getListingById = async (request, params) => {
  try {
    const listing = await Listing.findById(params.id).populate('seller', 'name email');

    if (listing) {
      return json(listing);
    } else {
      return json({ message: 'Listing not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
