import { Header } from "@/presentation/components/Header.js";
import { ProductList } from "@/presentation/components/ProductList.js";
import { CartModal } from "@/presentation/components/CartModal.js";

/**
 * Главная страница маркетплейса Technodom Clone.
 * Слой: Presentation (Page Server Component)
 */
export default function Home() {
  return (
      <main>
        <Header/>
        <div className="main-layout">
          <CartModal/>
          <ProductList />
        </div>
      </main>
  );
}
