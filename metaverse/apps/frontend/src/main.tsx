import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Provider from "./components/Providers.tsx";
import { Header } from "./components/header.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<Header />
			<App />
		</Provider>
	</StrictMode>
);
