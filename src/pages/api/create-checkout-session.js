const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export default async (req, res) => {
    //Checkout items catch in backend
    const { items, email } = req.body;

    const transformedItems = items.map(item => ({
        // description: item.description,
        // images: [item.image],
        // name: item.title,
        // amount: item.price * 100,
        quantity: 1,//change if grouping similar items together
        price_data: {
            currency: "inr",
            unit_amount: item.price * 100,
            product_data: {
                name: item.title,
                description: item.description,
                images: [item.image],
            },
        },
    }));
// Success and cancel url will be diff in local env and change in production env
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        shipping_options:[{shipping_rate:'shr_1M961LSDfwdZC1n4Ey3CApzp'}],//created in stripe account
        shipping_address_collection: {
            allowed_countries: ['IN', 'US', 'GB', 'CA']//array of countries allowed
        },
        line_items: transformedItems,
        mode: "payment",
        success_url: `${process.env.HOST}/success`,
        cancel_url: `${process.env.HOST}/checkout`,//go back to checkout page
        metadata: {
            email,
            images: JSON.stringify(items.map(item => item.image))
        },
    });

    res.status(200).json({id:session.id});
};