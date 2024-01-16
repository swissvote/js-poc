import Footer from "./footer";
import TopMenu from "./top-menu";

function Layout({ children }: { children: any }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopMenu />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
export default Layout;
