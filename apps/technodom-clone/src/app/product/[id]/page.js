import React from 'react';
import { MarketplaceApiClient } from '@/application/api.client.js';
import { Header } from '@/presentation/components/Header.js';
import { Footer } from '@/presentation/components/Footer.js';

/**
 * Динамическая страница детального просмотра товара (Server Component).
 * Слой: Presentation (SSR Node.js Runtime)
 *
 * @param {Object} props
 * @param {Object} props.params - Динамические параметры пути Next.js
 * @param {string} props.params.id - UUID конкретного товара
 * @returns {Promise<React.JSX.Element>}
 */
export default async function ProductDetailPage({ params }) {
	const { id } = params;
	
	// Инициализируем клиент на сервере. Внутри докер-контейнера он пойдет на marketplace-service напрямую.
	const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
	const apiClient = new MarketplaceApiClient(marketplaceUrl);
	
	// Запрос выполняется на сервере Node.js во время обработки HTTP-запроса (SSR)
	const product = await apiClient.getProductById(id);
	
	return (
			<div className="product-page-layout">
				<Header />
				<main className="product-detail">
					<div className="product-detail__container">
						<div className="product-detail__gallery">
							<div className="product-detail__image-big">🛒</div>
						</div>
						
						<div className="product-detail__info">
							<h1 className="product-detail__title">{product.title}</h1>
							
							<div className="product-detail__installment-card">
								<span className="product-detail__installment-badge">Финтех-рассрочка</span>
								<p className="product-detail__installment-text">
									{`В рассрочку от ${product.installmentPrice.toLocaleString()} ₸/мес на 24 месяца`}
								</p>
							</div>
							
							<div className="product-detail__price-block">
								<span className="product-detail__price-label">Цена:</span>
								<span className="product-detail__price-value">{`${product.price.toLocaleString()} KZT`}</span>
							</div>
							
							<button className="product-detail__buy-btn">Добавить в корзину</button>
						</div>
					</div>
				</main>
				<Footer />
			</div>
	);
}
