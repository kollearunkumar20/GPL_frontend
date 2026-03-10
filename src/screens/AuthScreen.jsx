import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { C, font } from "../utils/theme";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: 20,
      fontFamily: font,
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48 }}>🏏</div>
        <div style={{ color: C.text, fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>GPL</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Gully Premier League</div>
      </div>

      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "32px 24px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}>
        <h2 style={{ color: C.text, margin: "0 0 20px 0", textAlign: "center", fontSize: 20 }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {errorMsg && (
          <div style={{
            background: C.red + "22",
            color: C.red,
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            textAlign: "center",
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: C.green + "22",
            color: C.green,
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            textAlign: "center",
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: C.textMuted, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.text,
                fontSize: 16,
                fontFamily: font,
                outline: "none",
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label style={{ display: "block", color: C.textMuted, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.text,
                fontSize: 16,
                fontFamily: font,
                outline: "none",
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: C.green,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font,
              marginTop: 10,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            style={{
              background: "none",
              border: "none",
              color: C.blue,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: font,
              fontWeight: 600,
            }}
          >
            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
