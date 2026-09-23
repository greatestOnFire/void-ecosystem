import { MarketplaceApiClient } from "@/application/api.client.js";
import { Header } from "@/presentation/components/Header.js";
import { ProductList } from "@/presentation/components/ProductList.js";
import {CartModal} from "@/presentation/components/CartModal.js";

/**
 * Главная страница маркетплейса Technodom Clone.
 * Слой: Presentation (Page Server Component)
 */
export default function Home() {
  const apiClient = new MarketplaceApiClient('http://localhost:3002');
  
  return (
      <main>
        <Header/>
        <div className={'main-layout'}>
          <CartModal/>
          <ProductList apiClient={apiClient} />
        </div>
      </main>
  );
}
