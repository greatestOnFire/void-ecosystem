'use client';

import React from 'react';

/**
 * Shared UI Kit: Универсальный компонент кнопки.
 * @param {Object} props
 * @param {string} props.title - Текст внутри кнопки
 * @param {function(): void} props.onClick - Обработчик события клика
 * @param {string} props.className - CSS-класс для стилизации
 * @returns {React.JSX.Element}
 */
export function Button({ title, onClick, className }) {
	return (
			<button className={className} onClick={onClick}>
				{title}
			</button>
	);
}
