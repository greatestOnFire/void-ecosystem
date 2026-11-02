'use client';

import React from 'react';

/**
 * Shared UI Kit: Компонент фирменной финтех-плашки рассрочки маркетплейса.
 * @param {Object} props
 * @param {number} props.price - Ежемесячный платеж в KZT
 * @returns {React.JSX.Element}
 */
export function InstallmentBadge({ price }) {
	return (
			<div className="product-card__installment">
				<span className="product-card__installment-badge">В рассрочку</span>
				<span className="product-card__installment-value">
				{`от ${price.toLocaleString()} ₸/мес x 24`}
			</span>
			</div>
	);
}
