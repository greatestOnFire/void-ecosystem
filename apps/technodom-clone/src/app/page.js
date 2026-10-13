import { Header } from "@/presentation/components/Header.js";
import { PromoBanner } from "@/presentation/components/PromoBanner.js";
import { Sidebar } from "@/presentation/components/Sidebar.js";
import { ProductList } from "@/presentation/components/ProductList.js";
import { Footer } from "@/presentation/components/Footer.js";

export default function Home() {
  return (
      <main className="app-container">
        <Header />
        <div className="main-content-wrapper">
          <PromoBanner />
          <div className="main-layout">
            <Sidebar />
            <ProductList />
          </div>
        </div>
        <Footer />
      </main>
  );
}
