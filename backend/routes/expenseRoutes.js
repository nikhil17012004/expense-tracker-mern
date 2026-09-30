const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const expense = new Expense(req.body);
		const savedExpense = await expense.save();
		res.status(201).json(savedExpense);
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'CastError') {
			return res.status(400).json({
				message: 'Invalid expense data',
				details: error.message
			});
		}

		console.error('Error creating expense:', error);
		return res.status(500).json({ message: 'Failed to create expense' });
	}
});

module.exports = router;
