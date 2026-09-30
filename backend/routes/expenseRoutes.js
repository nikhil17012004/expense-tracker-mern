const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const expenses = await Expense.find().sort({ date: -1 });
		return res.status(200).json(expenses);
	} catch (error) {
		console.error('Error retrieving expenses:', error);
		return res.status(500).json({ message: 'Failed to retrieve expenses' });
	}
});

router.put('/:id', async (req, res) => {
	if (!mongoose.isObjectIdOrHexString(req.params.id)) {
		return res.status(400).json({ message: 'Invalid expense ID' });
	}

	const body = req.body;
	const requiredFields = ['title', 'amount', 'category', 'date'];
	if (!body || typeof body !== 'object' || Array.isArray(body) ||
		requiredFields.some(field => !Object.prototype.hasOwnProperty.call(body, field))) {
		return res.status(400).json({
			message: 'title, amount, category, and date are required'
		});
	}

	const updates = {
		title: body.title,
		amount: body.amount,
		category: body.category,
		date: body.date
	};
	if (Object.prototype.hasOwnProperty.call(body, 'description')) {
		updates.description = body.description;
	}

	try {
		const updatedExpense = await Expense.findByIdAndUpdate(
			req.params.id,
			{ $set: updates },
			{ new: true, runValidators: true }
		);

		if (!updatedExpense) {
			return res.status(404).json({ message: 'Expense not found' });
		}

		return res.status(200).json(updatedExpense);
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'CastError') {
			return res.status(400).json({
				message: 'Invalid expense data',
				details: error.message
			});
		}

		console.error('Error updating expense:', error);
		return res.status(500).json({ message: 'Failed to update expense' });
	}
});

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
