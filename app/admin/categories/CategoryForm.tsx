"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const categoryName = name.trim();

    if (!categoryName) {
      setError("Informe o nome da categoria.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao cadastrar categoria.");
        return;
      }

      setName("");

      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Não foi possível cadastrar a categoria.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="eyebrow">NOVA CATEGORIA</div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
          }}
        />

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "＋ Cadastrar"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: "10px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}