import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import ConvertPage from "./pages/ConvertPage";
import AnalyzePage from "./pages/AnalyzePage";
import YoutubePage from "./pages/YoutubePage";
import FilesPage from "./pages/FilesPage";
import "./App.css";

export const API = "http://localhost:3001";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <div className="logo-icon">♪</div>
            <span className="logo-text">Music Studio</span>
          </div>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/convert"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                end
              >
                <span className="nav-icon">⇄</span>
                Converter
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/analyze"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">≋</span>
                Analisar
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/youtube"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">▶</span>
                YouTube
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/files"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">⬡</span>
                Arquivos
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/convert" element={<ConvertPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/youtube" element={<YoutubePage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/" element={<ConvertPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
