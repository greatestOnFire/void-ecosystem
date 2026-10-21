import { PromoBanner } from "@/presentation/components/PromoBanner.js";
import { Sidebar } from "@/presentation/components/Sidebar.js";
import { ProductList } from "@/presentation/components/ProductList.js";

export default function Home() {
  return (
      <main className="app-container">
        <div className="main-content-wrapper">
          <PromoBanner />
          <div className="main-layout">
            <Sidebar />
            <ProductList />
          </div>
        </div>
      </main>
  );
}
