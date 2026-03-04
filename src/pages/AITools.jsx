import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const AITools = () => {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/ask",
        { query }
      );

      setOutput(res.data.result);
    } catch (error) {
      setOutput(
        "AI service unavailable. Make sure backend and Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          🔎 Ask AI Anything
        </h1>

        {/* Search Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <textarea
            className="w-full bg-gray-950 text-white p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="6"
            placeholder="Ask anything... Explain code, search repo, debug issue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition"
          >
            Ask AI
          </button>
        </div>

        {/* Output */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 min-h-[200px]">
          {loading ? (
            <div className="text-gray-400">Thinking...</div>
          ) : (
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match ? match[1] : "javascript"}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {output}
            </ReactMarkdown>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AITools;