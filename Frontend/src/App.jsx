import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import TokenizationPage from "./pages/TokenizationPage";
import URICreationPage from "./pages/URICreationPage";
import TokenBalancePage from "./pages/TokenBalancePage";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tokenization" element={<TokenizationPage />} />
        <Route path="/uri-creation" element={<URICreationPage />} />
        <Route path="/balance" element={<TokenBalancePage />} />
      </Routes>
    </div>
  );
}

export default App;
