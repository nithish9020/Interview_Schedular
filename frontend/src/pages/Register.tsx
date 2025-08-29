// src/pages/Register.tsx
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        setMessage("✅ User registered successfully!");
        setIsSuccess(true);
      } else {
        const text = await res.text();
        setMessage(text); // backend already sends clear message
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("❌ Error connecting to server");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Register</h1>
      <form className="flex flex-col gap-2 mt-4 w-80" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          type="submit"
        >
          Register
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
