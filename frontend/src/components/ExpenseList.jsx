import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/expenses';

function formatDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Invalid date';

	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

function ExpenseList() {
	const [expenses, setExpenses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		async function loadExpenses() {
			try {
				const response = await fetch(API_URL, { signal: controller.signal });
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
	}, []);

	return (
		<section aria-labelledby="expense-list-title">
			<h2 id="expense-list-title">Expenses</h2>

			{isLoading && <p role="status">Loading expenses...</p>}
			{!isLoading && error && <p role="alert">{error}</p>}
			{!isLoading && !error && expenses.length === 0 && (
				<p>No expenses yet. Add your first expense to see it here.</p>
			)}

			{!isLoading && !error && expenses.length > 0 && (
				<ul>
					{expenses.map(expense => (
						<li key={expense._id}>
							<article>
								<h3>{expense.title}</h3>
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
