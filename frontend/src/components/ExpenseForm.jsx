import { useState } from 'react';
import './ExpenseForm.css';

const API_URL = 'http://localhost:5000/api/expenses';
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Other'];

const createEmptyForm = () => ({
	title: '',
	amount: '',
	category: '',
	date: '',
	description: ''
});

function createFormFromExpense(expense) {
	if (!expense) return createEmptyForm();

	const date = new Date(expense.date);
	return {
		title: expense.title || '',
		amount: expense.amount == null ? '' : String(expense.amount),
		category: expense.category || '',
		date: Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10),
		description: expense.description || ''
	};
}

function validateForm(formData) {
	const errors = {};
	const amount = Number(formData.amount);

	if (!formData.title.trim()) {
		errors.title = 'Enter a title.';
	}
	if (!formData.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
		errors.amount = 'Enter an amount greater than 0.';
	}
	if (!CATEGORIES.includes(formData.category)) {
		errors.category = 'Choose a category.';
	}
	if (!formData.date || Number.isNaN(Date.parse(formData.date))) {
		errors.date = 'Choose a valid date.';
	}

	return errors;
}

function ExpenseForm({ expenseToEdit = null, onSaved, onCancel }) {
	const isEditing = Boolean(expenseToEdit?._id);
	const [formData, setFormData] = useState(() => createFormFromExpense(expenseToEdit));
	const [errors, setErrors] = useState({});
	const [apiError, setApiError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleChange(event) {
		const { name, value } = event.target;
		setFormData(current => ({ ...current, [name]: value }));
		setErrors(current => {
			if (!current[name]) return current;
			const nextErrors = { ...current };
			delete nextErrors[name];
			return nextErrors;
		});
		setApiError('');
		setSuccessMessage('');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setApiError('');
		setSuccessMessage('');

		const validationErrors = validateForm(formData);
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length > 0) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(
				isEditing ? `${API_URL}/${encodeURIComponent(expenseToEdit._id)}` : API_URL,
				{
				method: isEditing ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					title: formData.title.trim(),
					amount: Number(formData.amount),
					description: formData.description.trim()
				})
				}
			);
			const result = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					result?.details || result?.message || 'The expense could not be saved.'
				);
			}

			if (!isEditing) setFormData(createEmptyForm());
			setErrors({});
			setSuccessMessage(isEditing ? 'Expense updated.' : 'Expense saved.');
			onSaved?.();
		} catch (error) {
			setApiError(error.message || 'Unable to reach the server. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="expense-form-card" aria-labelledby="expense-form-title">
			<header className="expense-form-header">
				<p className="expense-form-kicker">TRANSACTION</p>
				<h2 id="expense-form-title">{isEditing ? 'Edit expense' : 'Add expense'}</h2>
			</header>

			<form className="expense-form" onSubmit={handleSubmit} noValidate>
				<div className="expense-form-grid">
					<div className="expense-field expense-field-wide">
						<label htmlFor="expense-title">Title</label>
						<input
							id="expense-title"
							name="title"
							type="text"
							value={formData.title}
							onChange={handleChange}
							maxLength={120}
							aria-invalid={Boolean(errors.title)}
							aria-describedby={errors.title ? 'expense-title-error' : undefined}
						/>
						{errors.title && <p className="expense-field-error" id="expense-title-error">{errors.title}</p>}
					</div>

					<div className="expense-field">
						<label htmlFor="expense-amount">Amount</label>
						<input
							id="expense-amount"
							name="amount"
							type="number"
							min="0"
							step="any"
							inputMode="decimal"
							value={formData.amount}
							onChange={handleChange}
							aria-invalid={Boolean(errors.amount)}
							aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
						/>
						{errors.amount && <p className="expense-field-error" id="expense-amount-error">{errors.amount}</p>}
					</div>

					<div className="expense-field">
						<label htmlFor="expense-category">Category</label>
						<select
							id="expense-category"
							name="category"
							value={formData.category}
							onChange={handleChange}
							aria-invalid={Boolean(errors.category)}
							aria-describedby={errors.category ? 'expense-category-error' : undefined}
						>
							<option value="">Select a category</option>
							{CATEGORIES.map(category => (
								<option key={category} value={category}>{category}</option>
							))}
						</select>
						{errors.category && <p className="expense-field-error" id="expense-category-error">{errors.category}</p>}
					</div>

					<div className="expense-field expense-field-wide">
						<label htmlFor="expense-date">Date</label>
						<input
							id="expense-date"
							name="date"
							type="date"
							value={formData.date}
							onChange={handleChange}
							aria-invalid={Boolean(errors.date)}
							aria-describedby={errors.date ? 'expense-date-error' : undefined}
						/>
						{errors.date && <p className="expense-field-error" id="expense-date-error">{errors.date}</p>}
					</div>

					<div className="expense-field expense-field-wide">
						<label htmlFor="expense-description">Description <span>(optional)</span></label>
						<textarea
							id="expense-description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							maxLength={500}
						/>
					</div>
				</div>

				{apiError && <p className="expense-form-message expense-form-error" role="alert">{apiError}</p>}
				{successMessage && <p className="expense-form-message expense-form-success" role="status">{successMessage}</p>}

				<button className="expense-submit" type="submit" disabled={isSubmitting}>
					{isSubmitting
						? (isEditing ? 'Updating…' : 'Saving…')
						: (isEditing ? 'Save changes' : 'Save expense')}
				</button>
				{isEditing && (
					<button
						className="expense-cancel"
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel editing
					</button>
				)}
			</form>
		</section>
	);
}

export default ExpenseForm;
