"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "./toast";

export function DocumentQA() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<
    { title: string; snippet: string; score: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<
    { title: string; chunks: number }[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch all uploaded documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      console.log("data", data);
      if (data.status === "success") {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch("/api/docs-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.body) {
        setError("Empty response stream.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      try {
        const parsed = JSON.parse(fullText);
        setAnswer(parsed.message || "No answer generated.");
        setSources(parsed.matchedDocuments || []);
      } catch (jsonErr) {
        console.error("JSON parse error:", jsonErr);
        setAnswer(fullText);
      }
    } catch (e) {
      console.error(e);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-doc", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          description: "✅ Upload Successful: " + data.message,
          type: "success",
        });
        fetchDocuments(); // Refresh doc list after upload
      } else {
        toast({
          description: `❌ Upload Failed: ${data.error}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        description: "❌ Upload Failed: Network/Server error",
        type: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleDelete = async (title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          description: `✅ Deleted: ${data.deletedChunks} chunks from "${title}"`,
          type: "success",
        });
        fetchDocuments();
      } else {
        toast({
          description: `❌ Failed: ${data.error}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        description: "❌ Delete failed: Network error",
        type: "error",
      });
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [question]);

  return (
    <div className="flex flex-col mx-auto px-4 pb-6 gap-6 w-full md:max-w-3xl text-foreground">
      <h2 className="text-3xl font-bold mt-4">📄 Document Q&A</h2>

      {/* Upload and Question Area */}
      <div className="relative flex items-start">
        <button
          type="button"
          onClick={handleFileClick}
          className="absolute left-2 top-3.5 text-gray-500 hover:text-gray-700"
          title="Upload document"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          placeholder="Ask a question about your uploaded documents..."
          value={question}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setQuestion(e.target.value);
              autoResize(e);
            }
          }}
          rows={2}
          style={{ overflow: "hidden", resize: "none" }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-background text-foreground"
        />
      </div>
      <span>Only Upload support ✅ (TXT)</span>

      {/* Ask button */}
      <button
        onClick={handleAsk}
        disabled={loading}
        className={`self-start px-4 py-2 rounded-xl flex items-center gap-2 text-primary-foreground transition-colors duration-200 ${
          loading
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin size-4 text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Thinking...
          </>
        ) : (
          "Ask Question"
        )}
      </button>

      {/* Error */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Answer */}
      {answer && (
        <div className="mt-4 border rounded-lg p-4 bg-primary text-primary-foreground">
          <h3 className="text-lg font-semibold mb-2">🧠 AI Answer:</h3>
          <p className="whitespace-pre-wrap">{answer}</p>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-1">
                📚 Source Documents:
              </h4>
              <ul className="space-y-3">
                {sources.map((doc, idx) => (
                  <li
                    key={idx}
                    className="border border-gray-200 rounded-md p-3 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="font-semibold text-primary">
                      {doc.title}
                    </div>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {doc.snippet.length > 150
                        ? doc.snippet.slice(0, 150) + "..."
                        : doc.snippet}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Similarity Score: {doc.score.toFixed(3)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📂 Uploaded Documents:</h3>
          <ul className="space-y-2">
            {documents.map((doc, idx) => (
              <li
                key={idx}
                className="border p-2 rounded flex justify-between items-center"
              >
                <span>
                  <strong>{doc.title}</strong> ({doc.chunks} chunks)
                </span>
                <button
                  onClick={() => handleDelete(doc.title)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
