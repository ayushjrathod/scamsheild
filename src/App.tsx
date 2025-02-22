import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Landing from "./components/Landing";
import Search from "./components/Search";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}

export default App;
