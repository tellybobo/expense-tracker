const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./Transaction');
const authRoutes = require('./auth');
const authMiddleware = require('./authMiddleware');
const User = require('./User');

const app = express();
const PORT = 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const { userId, ...updates } = req.body;

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/budget', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ monthlyBudget: user.monthlyBudget });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget' });
  }
});

app.put('/api/budget', authMiddleware, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (typeof monthlyBudget !== 'number' || monthlyBudget < 0) {
      return res.status(400).json({ message: 'Invalid budget' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { monthlyBudget },
      { new: true }
    );

    res.json({ monthlyBudget: updated.monthlyBudget });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save budget' });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));