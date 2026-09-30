const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 1
	},
	amount: {
		type: Number,
		required: true,
		validate: {
			validator: value => value > 0,
			message: 'Amount must be greater than 0'
		}
	},
	category: {
		type: String,
		required: true,
		enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Other']
	},
	date: {
		type: Date,
		required: true
	},
	description: {
		type: String
	}
});

module.exports = mongoose.model('Expense', expenseSchema);
