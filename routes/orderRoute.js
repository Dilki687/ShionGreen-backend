const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { name, email, product, quantity, phone, address, description, customerType } = req.body;

    // Check for required fields
    if (!name || !email || !product || !quantity || !phone || !address || !customerType) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate customerType
    if (!['Individual', 'Company'].includes(customerType)) {
      return res.status(400).json({ message: 'Invalid customer type. Must be either "Individual" or "Company".' });
    }

    const newOrder = new Order({ name, email, product, quantity, phone, address, description, customerType });
    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully!', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ message: 'Error deleting order' });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
