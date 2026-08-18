/**
 * @typedef {Object} QueryConfig
 * @property {string[]} queryKey - Уникальный ключ кэша для TanStack Query
 * @property {function(): Promise} queryFn - Функция запроса данных
 */

/**
 * Фабрика конфигурации запроса товаров для TanStack Query.
 * Слой: Application (Server State Management)
 *
 * @param {import('./api.client.js').MarketplaceApiClient} apiClient - Инстанс сетевого API-клиента
 * @returns {QueryConfig} Объект конфигурации для хука useQuery
 */
export function useProductsQueryContract(apiClient) {
	return {
		queryKey: ['products'],
		queryFn: () => apiClient.getProducts()
	};
}
