
import React from "react";

import { useAuth0 } from "@auth0/auth0-react";

import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = React.useState(null);
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();



  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{!data ? "Loading..." : data}</p>
      </header>
      {!isAuthenticated && <button onClick={() => loginWithRedirect()}>Log In</button>}
      {isAuthenticated && <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>}
      {isAuthenticated && (
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}

export default App;