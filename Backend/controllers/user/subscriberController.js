import Subscriber from '../../models/Subscriber.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'You are already subscribed!' });
    }

    await Subscriber.create({ email });

    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};