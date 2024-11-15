import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./pages/signup";
import Signin from "./pages/signin";
import Spaces from "./pages/spaces";
import Play from "./pages/Play";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/signup" element={<Signup />}></Route>
				<Route path="/signin" element={<Signin />}></Route>
				<Route path="/spaces" element={<Spaces />}></Route>
				<Route path="/play/:spaceId" element={<Play />}></Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
