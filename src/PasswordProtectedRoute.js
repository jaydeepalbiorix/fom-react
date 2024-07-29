
import React, { useState } from "react";
import axios from "axios";

const PasswordProtectedRoute = ({
  element: Element,
  host_development,
  onPasswordSubmit,
  ...rest
}) => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    setEnteredPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const response = await axios.post(`${host_development}/verify_password`, {
        password: enteredPassword,
      });
      if (response.data.success) {
        setIsAuthenticated(true);
        onPasswordSubmit(enteredPassword);
      } else {
        setError("Incorrect password!");
      }
    } catch (err) {
      setError("Error verifying password. Please try again later.");
    }
  };

  if (isAuthenticated) {
    return <Element host_development={host_development} {...rest} />;
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={enteredPassword}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Enter</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default PasswordProtectedRoute;
