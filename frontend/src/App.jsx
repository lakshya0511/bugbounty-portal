import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Unreviewed from "./pages/Unreviewed";
import Valid from "./pages/Valid";
import Invalid from "./pages/Invalid";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Unreviewed />} />
        <Route path="/valid" element={<Valid />} />
        <Route path="/invalid" element={<Invalid />} />
      </Routes>
    </Router>
  );
}

export default App;
