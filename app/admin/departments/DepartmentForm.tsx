"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DepartmentForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const departmentName = name.trim();

    if (!departmentName) {
      setError("Informe o nome do setor.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: departmentName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao cadastrar setor.");
        return;
      }

      setName("");

      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Não foi possível cadastrar o setor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="eyebrow">NOVO SETOR</div>

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
          placeholder="Nome do setor"
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