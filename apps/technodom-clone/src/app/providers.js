'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * @typedef {Object} ProvidersProps
 * @property {React.ReactNode} children - Дочерние элементы разметки страницы
 */

/**
 * Глобальный оберточный компонент для контекст-провайдеров фронтенда.
 * Слой: Infrastructure / Presentation (Client Component)
 *
 * @param {ProvidersProps} props
 * @returns {React.JSX.Element}
 */
export function Providers({ children }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				retry: 1,
			},
		},
	}));
	
	return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
	);
}
