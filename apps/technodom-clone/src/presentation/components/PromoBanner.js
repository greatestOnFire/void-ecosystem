'use client';

import React, { useState } from 'react';

/**
 * UI-компонент интерактивного промо-слайдера акций и рассрочек.
 * @returns {React.JSX.Element}
 */
export function PromoBanner() {
	const slides = [
		{
			id: 'slide-forte',
			badge: 'Акция ForteBank',
			title: 'Рассрочка 0-0-24 на всё!',
			subtitle: 'Покупайте электронику в честную рассрочку до конца недели без переплат.',
			icon: '📱'
		},
		{
			id: 'slide-halyk',
			badge: 'Halyk Market Bonus',
			title: '10% Кешбэка на Аудио',
			subtitle: 'Возвращаем бонусами при оплате картами любого банка на все наушники и колонки.',
			icon: '🎧'
		},
		{
			id: 'slide-technodom',
			badge: 'Technodom Special',
			title: 'Утилизация: Скидки до 50%',
			subtitle: 'Сдайте старую бытовую технику и получите гарантированную скидку на новую.',
			icon: '⚡'
		}
	];
	
	const [currentSlide, setCurrentSlide] = useState(0);
	
	const nextSlide = () => {
		setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
	};
	
	const prevSlide = () => {
		setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
	};
	
	const slide = slides[currentSlide];
	
	return (
			<section className="promo-banner">
				<div className="promo-banner__wrapper">
					<button className="promo-banner__arrow promo-banner__arrow--prev" onClick={prevSlide}>‹</button>
					
					<div className="promo-banner__content">
						<span className="promo-banner__badge">{slide.badge}</span>
						<h1 className="promo-banner__title">{slide.title}</h1>
						<p className="promo-banner__subtitle">{slide.subtitle}</p>
						<button className="promo-banner__btn">Подробнее</button>
					</div>
					
					<div className="promo-banner__image-mock">{slide.icon}</div>
					
					<button className="promo-banner__arrow promo-banner__arrow--next" onClick={nextSlide}>›</button>
				</div>
				<div className="promo-banner__dots">
					{slides.map((_, index) => (
							<span
									key={_.id}
									className={`promo-banner__dot ${index === currentSlide ? 'promo-banner__dot--active' : ''}`}
									onClick={() => setCurrentSlide(index)}
							/>
					))}
				</div>
			</section>
	);
}
