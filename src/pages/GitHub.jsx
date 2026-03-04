import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GitHub = () => {

  const [repos, setRepos] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [review, setReview] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("repos");



  /* ---------------- LANGUAGE DETECTION ---------------- */

  const getLanguage = (path) => {

    if (!path) return "javascript";

    const ext = path.split(".").pop();

    const map = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      java: "java",
      cs: "csharp",
      py: "python",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json"
    };

    return map[ext] || "javascript";
  };



  /* ---------------- CONNECT GITHUB ---------------- */

  const connectGitHub = () => {
    window.location.href = "http://localhost:5000/api/github/login";
  };



  /* ---------------- FETCH REPOSITORIES ---------------- */

  const fetchRepos = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/github/repos"
      );

      setRepos(res.data);
      setConnected(true);

    } catch (error) {

      console.log(error);
      setConnected(false);

    }

  };



  /* ---------------- FETCH FILES ---------------- */

  const fetchFiles = async (owner, repoName) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/github/repos/${owner}/${repoName}/files`
      );

      setFiles(res.data);
      setSelectedRepo({ owner, repoName });

      setView("files");

    } catch (error) {

      console.log("File list error:", error);

    }

  };



  /* ---------------- FETCH FILE CONTENT ---------------- */

  const fetchFileContent = async (path) => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/github/repos/${selectedRepo.owner}/${selectedRepo.repoName}/file?path=${path}`
      );

      setFileContent(res.data.content);
      setSelectedFile(path);
      setSelectedCode("");
      setReview("");

      setView("code");

    } catch (error) {

      console.log("File content error:", error);

    }

  };



  /* ---------------- AI REVIEW ---------------- */

  const reviewSelectedCode = async () => {

    try {

      setLoading(true);
      setReview("");

      const res = await axios.post(
        "http://localhost:5000/api/ai/ask",
        {
          query: `
You are a senior software engineer.

Review the following code and explain improvements.

Provide:
• Problem
• Suggestion
• Improved Example Code

Code:
${selectedCode}
`
        }
      );

      setReview(res.data.result);

    } catch (error) {

      console.log("Review error:", error);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {
    fetchRepos();
  }, []);



  return (

    <DashboardLayout>

      <div className="h-screen flex gap-4 p-4 transition-all duration-500">


        {/* ---------------- REPOSITORIES PANEL ---------------- */}

        <div className={`${view === "repos" ? "w-full" : "w-1/4"} bg-gray-900 rounded-lg p-4 overflow-y-auto transition-all duration-500`}>

          <h2 className="text-lg font-semibold mb-4">
            Repositories
          </h2>

          {!connected && (

            <button
              onClick={connectGitHub}
              className="bg-black text-white px-4 py-2 rounded border mb-4"
            >
              Connect GitHub
            </button>

          )}

          <div className="space-y-3">

            {repos.map(repo => (

              <div
                key={repo.id}
                onClick={() => fetchFiles(repo.owner.login, repo.name)}
                className="p-3 border border-gray-800 rounded cursor-pointer hover:border-indigo-500"
              >

                <p className="font-semibold">
                  {repo.name}
                </p>

                <p className="text-sm text-gray-400">
                  {repo.description}
                </p>

              </div>

            ))}

          </div>

        </div>



        {/* ---------------- FILES PANEL ---------------- */}

        {(view === "files" || view === "code") && (

          <div className="w-1/4 bg-gray-900 rounded-lg p-4 overflow-y-auto animate-slide">

            <h2 className="text-lg font-semibold mb-1">
              Files
            </h2>

            {selectedRepo && (
              <p className="text-xs text-indigo-400 mb-3">
                Repo: {selectedRepo.repoName}
              </p>
            )}

            <div className="space-y-2">

              {files.map(file => (

                <div
                  key={file.sha}
                  onClick={() => fetchFileContent(file.path)}
                  className="cursor-pointer text-indigo-400 hover:underline"
                >
                  {file.path}
                </div>

              ))}

            </div>

          </div>

        )}



        {/* ---------------- CODE PANEL ---------------- */}

        {view === "code" && (

          <div className="flex-1 bg-gray-900 rounded-lg p-4 flex flex-col animate-slide">

            <div className="mb-2">

              <h2 className="text-lg font-semibold">
                Code
              </h2>

              {selectedFile && (
                <p className="text-xs text-indigo-400">
                  File: {selectedFile.split("/").pop()}
                </p>
              )}

            </div>



            <div className="flex flex-col h-full gap-3">


              {/* CODE VIEWER */}

              <div
                className="h-[60%] overflow-auto border border-gray-800 rounded"
                onMouseUp={() => {

                  const selection = window.getSelection();
                  const text = selection ? selection.toString().trim() : "";

                  if (text.length > 0) {
                    setSelectedCode(text);
                  }

                }}
              >

                <SyntaxHighlighter
                  language={getLanguage(selectedFile)}
                  style={oneDark}
                  showLineNumbers
                >
                  {fileContent}
                </SyntaxHighlighter>

              </div>



              {/* REVIEW PANEL */}

              <div className="h-[40%] flex flex-col">

                {selectedCode?.length > 0 && (

                  <button
                    onClick={reviewSelectedCode}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded mb-2"
                  >
                    Review Selected Code
                  </button>

                )}



                {/* LOADING */}

                {loading && (

                  <div className="flex flex-col items-center justify-center flex-1">

                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>

                    <p className="text-gray-400">
                      AI is reviewing your code...
                    </p>

                  </div>

                )}



                {/* AI REVIEW RESULT */}

                {review && !loading && (

                  <div className="bg-black p-4 rounded border border-gray-700 flex-1 overflow-y-auto">

                    <h3 className="font-semibold mb-2 text-indigo-400">
                      AI Review
                    </h3>

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children }) {

                          const match = /language-(\w+)/.exec(className || "");

                          return !inline ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match ? match[1] : "javascript"}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-800 px-1 rounded text-pink-400">
                              {children}
                            </code>
                          );

                        }
                      }}
                    >
                      {review}
                    </ReactMarkdown>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default GitHub;