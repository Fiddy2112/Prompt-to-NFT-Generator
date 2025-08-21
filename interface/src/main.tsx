import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./routes/Layout.tsx";
import Home from "./routes/Home.tsx";
import Mint from "./routes/Mint.tsx";
import Marketplace from "./routes/Marketplace.tsx";
import MyNFTs from "./routes/MyNFTs.tsx";
import MyListings from "./routes/MyListings.tsx";
import { WalletProvider } from "./contexts/WalletContext.tsx";
import { Toaster } from "react-hot-toast";
import Admin from "./routes/Admin.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "mint",
        element: <Mint />,
      },
      {
        path: "marketplace",
        element: <Marketplace />,
      },
      {
        path: "my-nfts",
        element: <MyNFTs />,
      },
      {
        path: "my-listings",
        element: <MyListings />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <App /> */}
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
    <Toaster />
  </StrictMode>
);
