'use client';

import React from 'react';

/**
 * UI-компонент информационного подвала маркетплейса (Footer).
 * @returns {React.JSX.Element}
 */
export function Footer() {
	return (
			<footer className="footer">
				<div className="footer__container">
					<div className="footer__section">
						<h4 className="footer__title">Компания</h4>
						<ul className="footer__list">
							<li className="footer__item">О нас</li>
							<li className="footer__item">Карьера в Technodom</li>
							<li className="footer__item">Новости</li>
							<li className="footer__item">Контакты</li>
						</ul>
					</div>
					
					<div className="footer__section">
						<h4 className="footer__title">Покупателям</h4>
						<ul className="footer__list">
							<li className="footer__item">Условия доставки</li>
							<li className="footer__item">Обмен и возврат</li>
							<li className="footer__item">Сервисные центры</li>
							<li className="footer__item">Вопросы и ответы</li>
						</ul>
					</div>
					
					<div className="footer__section">
						<h4 className="footer__title">Финтех-сервисы</h4>
						<ul className="footer__list">
							<li className="footer__item">Рассрочка ForteBank</li>
							<li className="footer__item">Кредитование Halyk</li>
							<li className="footer__item">Оплата бонусами</li>
							<li className="footer__item">Idempotent Safe Payments</li>
						</ul>
					</div>
				</div>
				<div className="footer__bottom">
					<p className="footer__copyright">© 2026 Technodom Clone Ecosystem. Built with Node.js 24 LTS & TDD.</p>
				</div>
			</footer>
	);
}
