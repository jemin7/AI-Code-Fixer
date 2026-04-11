import { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

function App() {
  // Mode & UI State
  const [mode, setMode] = useState("single"); // "single" or "web"
  const [activeTab, setActiveTab] = useState("html"); // For Web Mode tabs

  // Single File State (Removed localStorage to clear on refresh)
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  // Web Project States (Removed localStorage to clear on refresh)
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  // AI Response States
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFixCode = async () => {
    // Validation
    if (mode === "single" && !code.trim()) return;
    if (mode === "web" && !htmlCode.trim() && !cssCode.trim() && !jsCode.trim())
      return;

    setLoading(true);
    setReview("");

    try {
      const payload =
        mode === "single"
          ? { mode: "single", code, language }
          : { mode: "web", html: htmlCode, css: cssCode, js: jsCode };

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(`${API_URL}/api/review`, payload);
      setReview(response.data.review);

      // Clear the input boxes automatically after a successful fix
      if (mode === "single") setCode("");
      if (mode === "web") {
        setHtmlCode("");
        setCssCode("");
        setJsCode("");
      }
    } catch (error) {
      console.error("Error:", error);
      setReview("❌ Failed to connect to the AI server.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="max-w-7xl mx-auto mb-8 text-center relative">
        <h1 className="text-4xl font-bold text-blue-400 tracking-wide">
          AI Code Fixer 🚀
        </h1>
        <p className="text-gray-400 mt-2">
          Paste broken code, get working code instantly.
        </p>

        {/* Mode Toggle Switch */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-800 p-1 rounded-lg inline-flex border border-gray-700 shadow-sm">
            <button
              onClick={() => setMode("single")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === "single" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Single File
            </button>
            <button
              onClick={() => setMode("web")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${mode === "web" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Web Project (HTML/CSS/JS)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[70vh]">
        {/* Left Side: Editor Area */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
            {mode === "single" ? (
              <>
                <h2 className="text-sm font-semibold text-gray-300">Editor</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-900 text-gray-200 text-sm rounded-md border border-gray-600 px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition ${activeTab === "html" ? "bg-orange-500/20 text-orange-400" : "text-gray-400 hover:bg-gray-600"}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab("css")}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition ${activeTab === "css" ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:bg-gray-600"}`}
                >
                  CSS
                </button>
                <button
                  onClick={() => setActiveTab("js")}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition ${activeTab === "js" ? "bg-yellow-500/20 text-yellow-400" : "text-gray-400 hover:bg-gray-600"}`}
                >
                  JS
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            {mode === "single" ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                }}
              />
            ) : (
              <>
                <div className={activeTab === "html" ? "h-full" : "hidden"}>
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language="html"
                    value={htmlCode}
                    onChange={(val) => setHtmlCode(val || "")}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
                <div className={activeTab === "css" ? "h-full" : "hidden"}>
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language="css"
                    value={cssCode}
                    onChange={(val) => setCssCode(val || "")}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
                <div className={activeTab === "js" ? "h-full" : "hidden"}>
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language="javascript"
                    value={jsCode}
                    onChange={(val) => setJsCode(val || "")}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <button
              onClick={handleFixCode}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                  Fixing...
                </>
              ) : (
                "Fix Code"
              )}
            </button>
          </div>
        </div>

        {/* Right Side: AI Output Area (Now looks exactly like the input) */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg relative">
          <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-300">Fixed Code</h2>
            {review && review !== "there is no bug in the code" && (
              <button
                onClick={copyToClipboard}
                className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition"
              >
                {copied ? "Copied! ✓" : "Copy Output"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="p-6 animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            ) : review ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language="markdown"
                value={review}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 italic p-6">
                Awaiting your code...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
