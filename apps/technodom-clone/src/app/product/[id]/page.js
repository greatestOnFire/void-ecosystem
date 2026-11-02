import React from 'react';
import { BuyButton } from '@/presentation/components/BuyButton.js';
import { InstallmentBadge } from "@/presentation/shared/InstallmentBadge.js";
/**
 * Динамическая страница детального просмотра товара (Server Component).
 * @param {Object} props
 * @param {Object} props.params
 * @returns {Promise<React.JSX.Element>}
 */
export default async function ProductDetailPage({ params }) {
	const { id } = await params;
	const marketplaceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3002';
	
	const response = await fetch(`${marketplaceUrl}/api/products/${id}`);
	const rawProduct = await response.json();
	
	if (!rawProduct || rawProduct.error) {
		throw new Error(rawProduct?.error || 'Product fetch contract mismatch inside SSR');
	}
	
	return (
			<div className="product-page-layout">
				<main className="product-detail">
					<div className="product-detail__container">
						<div className="product-detail__gallery">
							<div className="product-detail__image-big">🛒</div>
						</div>
						
						<div className="product-detail__info">
							<h1 className="product-detail__title">{rawProduct.title}</h1>
							
							<InstallmentBadge price={Math.floor(Number(rawProduct.price) / 24)} />
							
							<div className="product-detail__price-block">
								<span className="product-detail__price-label">Цена:</span>
								<span className="product-detail__price-value">{`${Number(rawProduct.price).toLocaleString()} KZT`}</span>
							</div>
							
							<BuyButton
									product={{ id: rawProduct.id, title: rawProduct.title, price: Number(rawProduct.price),
										stock: Number(rawProduct.stock) }} />
						</div>
					</div>
				</main>
			</div>
	);
}
