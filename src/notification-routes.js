import express from 'express';
import axios from 'axios';
import config from './config/chit/env.js';

const router = express.Router();

// Constants
const ONE_SIGNAL_APP_ID = config.ONE_SIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = config.ONE_SIGNAL_API_KEY;
const ONE_SIGNAL_API_HEADERS = {
  Authorization: `Basic ${ONE_SIGNAL_API_KEY}`
};

// Helper functions
const validateRequiredFields = (fields, req, res) => {
  for (const field of fields) {
    if (!req.body[field]) {
      res.status(400).json({ message: `${field} is required` });
      return false;
    }
  }
  return true;
};

const callOneSignalAPI = async (url, data) => {
  try {
    const response = await axios.put(url, {
      app_id: ONE_SIGNAL_APP_ID,
      ...data
    }, {
      headers: ONE_SIGNAL_API_HEADERS
    });
    return response.data;
  } catch (error) {
    console.error('OneSignal API error:', error);
    throw error;
  }
};

// Routes
router.post('/externalid', async (req, res) => {
  if (!validateRequiredFields(['playerId', 'userId'], req, res)) return;

  try {
    const data = await callOneSignalAPI(
      `https://onesignal.com/api/v1/players/${req.body.playerId}`,
      { external_user_id: req.body.userId }
    );
    res.status(200).json({ message: 'External ID created successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/remove-externalid', async (req, res) => {
  console.log(req.body)
  if (!validateRequiredFields(['playerId'], req, res)) return;

  try {
    const data = await callOneSignalAPI(
      `https://onesignal.com/api/v1/players/${req.body.playerId}`,
      { external_user_id: '' }
    );
    res.status(200).json({ message: 'External ID removed successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/remove-externalid-unsubscribe', async (req, res) => {
  if (!validateRequiredFields(['playerId'], req, res)) return;

  try {
    const removeResponse = await callOneSignalAPI(
      `https://onesignal.com/api/v1/players/${req.body.playerId}`,
      { external_user_id: '' }
    );

    if (removeResponse.success) {
      const unsubscribeResponse = await callOneSignalAPI(
        `https://onesignal.com/api/v1/players/${req.body.playerId}`,
        { notification_types: -2 }
      );
      return res.status(200).json({ 
        message: 'Unsubscribed successfully', 
        data: unsubscribeResponse 
      });
    }

    res.status(400).json({ message: 'Failed to Unsubscribe', data: false });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  if (!validateRequiredFields(['playerId'], req, res)) return;

  try {
    const data = await callOneSignalAPI(
      `https://onesignal.com/api/v1/players/${req.body.playerId}`,
      { notification_types: -2 }
    );
    res.status(200).json({ message: 'Player unsubscribed successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;