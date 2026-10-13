import { Header } from "@/presentation/components/Header.js";
import { PromoBanner } from "@/presentation/components/PromoBanner.js";
import { Sidebar } from "@/presentation/components/Sidebar.js";
import { ProductList } from "@/presentation/components/ProductList.js";
import { CartModal } from "@/presentation/components/CartModal.js";

/**
 * Главная страница маркетплейса Technodom Clone.
 * Слой: Presentation (Page Server Component)
 */
export default function Home() {
  return (
      <main className="app-container">
        <Header />
        <div className="main-content-wrapper">
          <PromoBanner />
          <div className="main-layout">
            <Sidebar />
            <ProductList />
            <CartModal />
          </div>
        </div>
      </main>
  );
}
