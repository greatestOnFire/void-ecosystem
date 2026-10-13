'use client';

import React from 'react';

/**
 * UI-компонент промо-баннера рассрочки и акций.
 * @returns {React.JSX.Element}
 */
export function PromoBanner() {
	return (
			<section className="promo-banner">
				<div className="promo-banner__wrapper">
					<div className="promo-banner__content">
						<span className="promo-banner__badge">Акция ForteBank</span>
						<h1 className="promo-banner__title">Рассрочка 0-0-24</h1>
						<p className="promo-banner__subtitle">На все смартфоны и бытовую технику до конца недели</p>
						<button className="promo-banner__btn">Смотреть товары</button>
					</div>
					<div className="promo-banner__image-mock">📱 💻 📺</div>
				</div>
			</section>
	);
}
