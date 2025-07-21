import crypto from "crypto";
import config from "./env.js";
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/cashfree", async (req, res) => {
  const secretKey = config.CASHFREE_SECRET;

  if (!secretKey) {
    console.error("SECRET_KEY is missing in environment variables.");
    return res
      .status(500)
      .json({ message: "Server error: SECRET_KEY not configured." });
  }

  const signature = req.headers["x-webhook-signature"];
  const payload = req.rawBody;
  const body = req.headers["x-webhook-timestamp"] + payload;

  if (!payload) {
    console.error("Raw payload is undefined.");
    return res.status(400).json({ message: "Invalid payload" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(body)
    .digest("base64");

  if (signature !== generatedSignature) {
    console.error("Invalid Signature: Possible spoofing attempt.");
    return res.status(403).json({ message: "Invalid signature" });
  }

  res.status(200).json({ message: "Webhook received successfully" });
});

// Example order details
const orderDetails = {
    order_id: 'order_12346',
    order_amount: 100.50,
    order_currency: 'INR',
    customer_details: {
        customer_id: 'customer_123',
        customer_name: 'John Doe',
        customer_email: 'john.doe@example.com',
        customer_phone: '1234567890'
    },
    order_meta: {
        return_url: 'https://example.com/return'
    }
};

router.post("/create-order", async (req, res) => {
  const url = "https://sandbox.cashfree.com/pg/orders";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": config.CASHFREE_CLIENT_ID,
    "x-client-secret": config.CASHFREE_SECRET,
    "x-api-version": config.API_VERSION,
  };

  try {
    const response = await axios.post(url, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message
    );
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Internal Server Error" });
  }
});

// Example payment link details
const paymentLinkDetails = {
    order_id: 'order_12346',
    link_amount: 100.50,
    link_currency: 'INR',
    link_id: 'order_12348',
    link_purpose:'scheme payment',
    link_notify:{
        send_sms:false,
        send_email:false
    },
    customer_details: {
        customer_name: 'John Doe',
        customer_email: 'john.doe@example.com',
        customer_phone: '1234567890'
    },
    order_meta: {
        return_url: 'https://example.com/return'
    }
};

router.post ('/payment', async (req,res) => {
  const url = "https://sandbox.cashfree.com/pg/links";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": config.CASHFREE_CLIENT_ID,
    "x-client-secret": config.CASHFREE_SECRET,
    "x-api-version": "2022-01-01" || config.API_VERSION,
  };

  try {
    const response = await axios.post(url, paymentLinkDetails, { headers });

    return res.status(200).json(response.data);
} catch (error) {
    console.error("Error generating payment link:", error.response?.data || error.message);
    return res.status(500).json({ error: 'Payment link generation failed' });
}
});

router.get ('/status', async (req,res) => {
  const url = "https://sandbox.cashfree.com/pg/orders/67f4cde7331d493f9e8f2c4017452617396121221/payments";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": config.CASHFREE_CLIENT_ID,
    "x-client-secret": config.CASHFREE_SECRET,
    "x-api-version": "2022-01-01" || config.API_VERSION,
  };

  try {
    const response = await axios.get(url, { headers });

    return res.status(200).json(response.data);
} catch (error) {
    console.error("Error generating payment link:", error.response?.data || error.message);
    return res.status(500).json({ error: 'Payment link generation failed' });
}
});

export default router;