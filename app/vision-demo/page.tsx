"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VisionDemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults([]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            ANC Studio <span className="text-blue-500">Vision Engine</span>
          </h1>
          <p className="text-zinc-400">
            Upload an architectural drawing to test the "Blue Glow" extraction logic.
            Powered by Z AI (GLM-4V).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Input Drawing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-4 hover:bg-zinc-800/50 transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-64 object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-zinc-500 mb-4" />
                    <p className="text-sm text-zinc-400">Drag and drop or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={!file || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Structure...
                  </>
                ) : (
                  "Run Extraction"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Extracted Data ("Master Truth")</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 && !loading && (
                <div className="h-64 flex items-center justify-center text-zinc-500 text-sm italic">
                  No data extracted yet.
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="h-12 bg-zinc-800 animate-pulse rounded" />
                   ))}
                </div>
              )}

              <div className="space-y-4">
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded border ${
                      item.needsVerification 
                        ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                        : "bg-green-900/10 border-green-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                          {item.field}
                        </p>
                        <p className="text-lg font-mono font-medium text-white">
                          {item.value}
                        </p>
                      </div>
                      {item.needsVerification ? (
                        <div className="flex items-center text-blue-400 text-xs font-bold bg-blue-400/10 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Verify ({Math.round(item.confidence * 100)}%)
                        </div>
                      ) : (
                        <div className="flex items-center text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
