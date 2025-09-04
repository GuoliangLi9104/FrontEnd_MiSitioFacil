import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Register() {
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      // No asumimos que el BE devuelve token.
      const res = await api.register({ fullName, email, password });

      // Si el BE devuelve token, entramos directo; si no, vamos al login.
      if (res?.token) {
        localStorage.setItem("token", res.token); // redundante si api ya lo guardó, pero seguro
        navigate("/", { replace: true });
      } else {
        navigate("/login?registered=1", { replace: true });
      }
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "No se pudo registrar";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card p-4">
          <h4 className="mb-2">Crear cuenta</h4>
          <p className="text-muted">Empieza a construir tu sitio en minutos.</p>
          {err && <div className="alert alert-danger">{err}</div>}
          <form onSubmit={submit} className="vstack gap-3">
            <input
              className="form-control"
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="form-control"
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="form-control"
              type="password"
              placeholder="Contraseña (mín. 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button className="btn btn-brand" disabled={loading}>
              {loading ? "Creando…" : "Crear cuenta"}
            </button>
            <div className="text-muted small">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
