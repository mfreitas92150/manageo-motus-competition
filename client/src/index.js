import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const providerConfig = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  ...(process.env.REACT_APP_AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : null),
  redirectUri: window.location.origin
};

ReactDOM.render(
  <Auth0Provider {...providerConfig}  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
