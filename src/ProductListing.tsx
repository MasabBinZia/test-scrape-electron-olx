import React, { useState, useEffect } from "react";
import { useTwitterLoggedIn } from "../src/store/app-store";

interface ElectronWindow extends Window {
  electron?: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  };
}

declare const window: ElectronWindow;

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const twitterLoggedIn = useTwitterLoggedIn();

  useEffect(() => {
    const fetchData = async () => {
      if (!twitterLoggedIn) {
        setLoading(false);
        setError("Please connect to Twitter to fetch data.");
        return;
      }

      try {
        console.log("Window object:", window);
        console.log("Electron object:", window.electron);

        if (!window.electron) {
          throw new Error("Electron IPC is not available");
        }

        console.log("Invoking scrape-olx");
        const data = await window.electron.ipcRenderer.invoke("scrape-olx");
        console.log("Scraped data:", data);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`An error occurred while fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [twitterLoggedIn]);

  useEffect(() => {
    if (twitterLoggedIn) {
      setError(null);
      setLoading(true);
      setProducts([]);
    }
  }, [twitterLoggedIn]);

  return (
    <div className="main">
      <h1>MacBook Listings from OLX Pakistan</h1>
      {loading ? (
        <div className="loader"></div>
      ) : error ? (
        <p>{error}</p>
      ) : products.length === 0 ? (
        <p>No products found. Please check the console for any issues.</p>
      ) : (
        <ul>
          {products.map((product, index) => (
            <li key={index}>
              <h3>{product.title}</h3>
              <p>Price: {product.price}</p>
              <p>Location: {product.location}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductListing;
