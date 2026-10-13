'use client';

import React from 'react';

/**
 * UI-компонент бокового меню категорий каталога.
 * @returns {React.JSX.Element}
 */
export function Sidebar() {
	const categories = [
		{ id: 'smartphones', name: 'Смартфоны и гаджеты', icon: '📱' },
		{ id: 'laptops', name: 'Ноутбуки и компьютеры', icon: '💻' },
		{ id: 'audio', name: 'Аудиотехника', icon: '🎧' },
		{ id: 'tv', name: 'Телевизоры и видео', icon: '📺' },
		{ id: 'appliances', name: 'Бытовая техника', icon: '⚡' }
	];
	
	return (
			<aside className="sidebar">
				<ul className="sidebar__list">
					{categories.map((category) => (
							<li key={category.id} className="sidebar__item">
								<span className="sidebar__item-icon">{category.icon}</span>
								<span className="sidebar__item-name">{category.name}</span>
							</li>
					))}
				</ul>
			</aside>
	);
}
