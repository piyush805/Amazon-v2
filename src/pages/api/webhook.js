import { buffer } from "micro";
import * as admin from "firebase-admin";

const serviceAccount = require("../../../permissions.json"); //Node

//If not already, initialise it, else use exisiting 
const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
}) : admin.app();

//Establish connection to stipe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

const fulfillOrder = async (session) => {
    // console.log("Fulfilling order===================", session);
    return app.
        firestore().
        collection("users").
        doc(session.metadata.email).
        collection("orders").
        doc(session.id).
        set({
            amount: session.amount_total / 100,
            amount_shipping: session.total_details.amount_shipping / 100,
            images: JSON.parse(session.metadata.images),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
            console.log(`SUCCESS: Order ${session.id} had been added to the DB`);
        })
}

export default async (req, res) => {
    if (req.method == "POST") {
        const requestBuffer = await buffer(req);
        const payload = requestBuffer.toString();
        const sig = req.headers["stripe-signature"];

        let event;
        //Verify that the EVENT hosted came from the stripe
        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            console.log("ERROR", err.message);
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        //Handle the checkout.session.completed event 
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            //Full fill the order
            return fulfillOrder(session).
                then(() => res.status(200)).
                catch((err) => res.status(400).send(`Webhook Error: ${err.message}`));
        }
    }
};
//configure each end point with a config file and then change that config file using this
export const config = {
    api: {
        bodyParser: false,//wheh handling a wehook, dont want a body parser, we want request as a stream not a passed object 
        externalResolver: true
    }
}
