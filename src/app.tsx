import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { TwitterConnect } from "./twitter-connect";
import ProductListing from "./ProductListing";

const appContainer = document.getElementById("react-container");

const root = createRoot(appContainer);
root.render(
<main className="main">
<TwitterConnect/>
<ProductListing/>

</main>
);
