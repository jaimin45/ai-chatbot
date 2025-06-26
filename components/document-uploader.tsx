"use client";

import { useState, useRef } from "react";
import { Paperclip } from "lucide-react";

export function DocumentUploaderInput() {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // TODO: Upload logic here (you can POST to /api/upload-doc)
      console.log("Selected file:", file.name);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center border rounded-md px-2 py-1 bg-background text-foreground">
      {/* File upload icon */}
      <button
        type="button"
        onClick={triggerFileSelect}
        className="p-1 text-gray-500 hover:text-gray-700"
        title="Attach document"
      >
        <Paperclip size={18} />
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt"
        onChange={handleFileSelect}
      />

      {/* Text input */}
      <input
        type="text"
        placeholder="Ask your question..."
        className="grow outline-none px-2 bg-transparent"
      />

      {/* Optional: show selected filename */}
      {fileName && (
        <span className="ml-2 text-sm text-gray-500 truncate max-w-[100px]">
          {fileName}
        </span>
      )}
    </div>
  );
}
