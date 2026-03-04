import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const GitHub = () => {
  const [repos, setRepos] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [review, setReview] = useState("");
  const [connected, setConnected] = useState(false);

  // 🔹 Connect GitHub
  const connectGitHub = () => {
    window.location.href = "http://localhost:5000/api/github/login";
  };

  // 🔹 Fetch Repositories
  const fetchRepos = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/github/repos"
      );
      setRepos(res.data);
      setConnected(true);
    } catch (error) {
      setConnected(false);
    }
  };

  // 🔹 Fetch Files of Selected Repo
  const fetchFiles = async (owner, repoName) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/github/repos/${owner}/${repoName}/files`
      );
      setFiles(res.data);
      setSelectedRepo({ owner, repoName });
      setFileContent("");
      setReview("");
    } catch (error) {
      console.log("File list error:", error);
    }
  };

  // 🔹 Fetch File Content
  const fetchFileContent = async (path) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/github/repos/${selectedRepo.owner}/${selectedRepo.repoName}/file?path=${path}`
      );
      setFileContent(res.data.content);
      setSelectedCode("");
      setReview("");
    } catch (error) {
      console.log("File content error:", error);
    }
  };

  // 🔹 Review Selected Code
  const reviewSelectedCode = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/ask",
        {
          query: `Review this code and suggest improvements:\n\n${selectedCode}`
        }
      );
      setReview(res.data.result);
    } catch (error) {
      console.log("Review error:", error);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          GitHub Repositories
        </h1>

        {!connected && (
          <button
            onClick={connectGitHub}
            className="bg-black text-white px-6 py-2 rounded-lg border"
          >
            Connect GitHub
          </button>
        )}

        {/* REPOSITORIES */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {repos.map(repo => (
            <div
              key={repo.id}
              onClick={() => fetchFiles(repo.owner.login, repo.name)}
              className="bg-gray-900 border border-gray-800 p-4 rounded-lg cursor-pointer hover:border-indigo-500"
            >
              <h3 className="font-semibold text-lg">
                {repo.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {repo.description}
              </p>
            </div>
          ))}
        </div>

        {/* FILE LIST */}
        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Files
            </h2>

            <div className="space-y-2">
              {files.map(file =>
                file.type === "file" && (
                  <div
                    key={file.sha}
                    onClick={() => fetchFileContent(file.path)}
                    className="cursor-pointer text-indigo-400 hover:underline"
                  >
                    {file.name}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* FILE CONTENT */}
        {fileContent && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Code
            </h2>

            <textarea
              value={fileContent}
              readOnly
              onMouseUp={() => {
                const selection = window.getSelection().toString();
                setSelectedCode(selection);
              }}
              className="w-full h-96 bg-black text-green-400 p-4 font-mono rounded"
            />

            {selectedCode && (
              <div className="mt-4">
                <button
                  onClick={reviewSelectedCode}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
                >
                  Review Selected Code
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI REVIEW */}
        {review && (
          <div className="mt-8 bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">
              AI Review
            </h2>
            <pre className="whitespace-pre-wrap text-gray-300">
              {review}
            </pre>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default GitHub;