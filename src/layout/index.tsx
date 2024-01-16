import TopMenu from "./top-menu";

function Layout({ children }: { children: any }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopMenu />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
export default Layout;
