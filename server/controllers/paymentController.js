// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const Listing = require('../models/Listing');

// const createCheckoutSession = async (req, res) => {
//   try {
//     const { listingId } = req.body;

//     const listing = await Listing.findById(listingId);
//     if (!listing) {
//       return res.status(404).json({ message: 'Listing not found' });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: `Guest Post on ${listing.url}`,
//               description: `Niche: ${listing.category}`,
//             },
//             unit_amount: listing.price * 100, 
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       metadata: {
//         listingId: listingId,
//         buyerId: req.user.id,
//       },
//       success_url: `${process.env.FRONTEND_URL}/orders?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/`,
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { createCheckoutSession };