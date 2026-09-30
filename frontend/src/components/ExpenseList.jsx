import { useEffect, useState } from 'react';
import './ExpenseList.css';

const API_URL = 'http://localhost:5000/api/expenses';
const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Other'];

function formatDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Invalid date';

	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

function ExpenseList({ onEdit, onDeleted, refreshKey }) {
	const [expenses, setExpenses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [deleteError, setDeleteError] = useState('');
	const [deletingId, setDeletingId] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState('All');

	useEffect(() => {
		const controller = new AbortController();

		async function loadExpenses() {
			setIsLoading(true);
			setError('');
			try {
				const url = selectedCategory === 'All'
					? API_URL
					: `${API_URL}?category=${encodeURIComponent(selectedCategory)}`;
				const response = await fetch(url, { signal: controller.signal });
				const data = await response.json().catch(() => null);

				if (!response.ok) {
					throw new Error(data?.message || 'Could not load expenses.');
				}
				if (!Array.isArray(data)) {
					throw new Error('The server returned an unexpected response.');
				}

				setExpenses(data);
			} catch (requestError) {
				if (requestError.name !== 'AbortError') {
					setError(
						requestError.name === 'TypeError'
							? 'Could not connect to the server. Check that it is running and try again.'
							: requestError.message || 'Could not load expenses.'
					);
				}
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		loadExpenses();
		return () => controller.abort();
	}, [refreshKey, selectedCategory]);

	async function handleDelete(expense) {
		setDeleteError('');
		if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;

		setDeletingId(expense._id);
		try {
			const response = await fetch(`${API_URL}/${encodeURIComponent(expense._id)}`, {
				method: 'DELETE'
			});
			const result = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(result?.message || 'Could not delete expense.');
			}

			setExpenses(current => current.filter(item => item._id !== expense._id));
			onDeleted?.(expense._id);
		} catch (requestError) {
			setDeleteError(
				requestError.name === 'TypeError'
					? 'Could not connect to the server. Check that it is running and try again.'
					: requestError.message || 'Could not delete expense.'
			);
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<section className="expense-list" aria-labelledby="expense-list-title">
			<h2 id="expense-list-title">Expenses</h2>
			<div className="expense-filter">
				<label htmlFor="expense-category-filter">Category</label>
				<select
					id="expense-category-filter"
					value={selectedCategory}
					onChange={event => setSelectedCategory(event.target.value)}
				>
					<option value="All">All</option>
					{CATEGORIES.map(category => (
						<option key={category} value={category}>{category}</option>
					))}
				</select>
			</div>

			{deleteError && <p className="expense-delete-error" role="alert">{deleteError}</p>}
			{isLoading && <p role="status">Loading expenses...</p>}
			{!isLoading && error && <p role="alert">{error}</p>}
			{!isLoading && !error && expenses.length === 0 && (
				<p>
					{selectedCategory === 'All'
						? 'No expenses yet. Add your first expense to see it here.'
						: `No ${selectedCategory} expenses found.`}
				</p>
			)}

			{!isLoading && !error && expenses.length > 0 && (
				<ul className="expense-list-items">
					{expenses.map(expense => (
						<li className="expense-list-item" key={expense._id}>
							<article>
								<div className="expense-list-heading">
									<h3>{expense.title}</h3>
									<div className="expense-list-actions">
										<button
											className="expense-edit-button"
											type="button"
											disabled={deletingId === expense._id}
											onClick={() => onEdit(expense)}
										>
											Edit
										</button>
										<button
											className="expense-delete-button"
											type="button"
											disabled={deletingId !== null}
											onClick={() => handleDelete(expense)}
										>
											{deletingId === expense._id ? 'Deleting…' : 'Delete'}
										</button>
									</div>
								</div>
								<dl>
									<div>
										<dt>Amount</dt>
										<dd>{Number(expense.amount).toLocaleString()}</dd>
									</div>
									<div>
										<dt>Category</dt>
										<dd>{expense.category}</dd>
									</div>
									<div>
										<dt>Date</dt>
										<dd>{formatDate(expense.date)}</dd>
									</div>
									<div>
										<dt>Description</dt>
										<dd>{expense.description || 'No description provided.'}</dd>
									</div>
								</dl>
							</article>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default ExpenseList;
