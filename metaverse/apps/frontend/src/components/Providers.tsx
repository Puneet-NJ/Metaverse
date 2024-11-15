import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme-provider";
import { RecoilRoot } from "recoil";

const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<RecoilRoot>
					<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
						{children}
					</ThemeProvider>
				</RecoilRoot>
			</QueryClientProvider>
		</>
	);
};

export default Provider;
