import { useState } from "react"
import { auth } from "../lib/api.js"
import { Button, Field, Input, Icons } from "./ui.jsx"

export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const session = await auth.signIn(email, password)
      onSignedIn?.(session)
    } catch (err) {
      setError(err.message || "Could not sign in. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin">
      <div className="a-login">
        <form className="a-login-card" onSubmit={submit}>
          <div className="mark">
            <Icons.lock />
          </div>
          <h1>Dashboard sign in</h1>
          <p className="sub">Manage your portfolio content and blog.</p>
          <div className="a-form-stack">
            {error && <div className="a-error">{error}</div>}
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
            <Button variant="primary" type="submit" loading={loading} style={{ width: "100%" }}>
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
