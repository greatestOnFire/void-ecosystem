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
 * @returns {Promise<React.JSX.Element>}
 */
export default async function ProductDetailPage({ params }) {
	// В Next.js 16/16+ params является асинхронным объектом, разворачиваем его деструктуризацией
	const { id } = await params;
	
	// На сервере инициализируем клиент напрямую к порту бизнес-ядра маркетплейса
	const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
	
	// Создаем изолированный инстанс клиента для прямого серверного запроса (Transit SSR Route)
	// Мы временно подменим базовый путь для серверного fetch, чтобы он шел напрямую в ядро /api/products
	const serverApiClient = new MarketplaceApiClient(marketplaceUrl);
	
	// Точечно адаптируем вызов: на бэкенде путь устроен как /api/products/[id]
	// Чтобы не плодить дублирующие методы, мы вызовем fetch напрямую к защищенному ядру СУБД
	const response = await fetch(`${marketplaceUrl}/api/products/${id}`);
	const rawProduct = await response.json();
	
	if (!rawProduct || rawProduct.error) {
		throw new Error(rawProduct?.error || 'Product fetch contract mismatch inside SSR');
	}
	
	return (
			<div className="product-page-layout">
				<Header />
				<main className="product-detail">
					<div className="product-detail__container">
						<div className="product-detail__gallery">
							<div className="product-detail__image-big">🛒</div>
						</div>
						
						<div className="product-detail__info">
							<h1 className="product-detail__title">{rawProduct.title}</h1>
							
							<div className="product-detail__installment-card">
								<span className="product-detail__installment-badge">Финтех-рассрочка</span>
								<p className="product-detail__installment-text">
									{`В рассрочку от ${Math.floor(Number(rawProduct.price) / 24).toLocaleString()} ₸/мес на 24 месяца`}
								</p>
							</div>
							
							<div className="product-detail__price-block">
								<span className="product-detail__price-label">Цена:</span>
								<span className="product-detail__price-value">{`${Number(rawProduct.price).toLocaleString()} KZT`}</span>
							</div>
							
							<button className="product-detail__buy-btn">Добавить в корзину</button>
						</div>
					</div>
				</main>
				<Footer />
			</div>
	);
}
