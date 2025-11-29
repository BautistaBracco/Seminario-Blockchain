"use client";

import { useState } from "react";

export function useIPFS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload error");

      return json.cid;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadJSON = async (data: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/ipfs/json", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload JSON error");

      return json.cid;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, uploadJSON, loading, error };
}
