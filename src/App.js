import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import awsmobile from "./aws-exports";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { graphql, compose, withApollo, ApolloProvider } from "react-apollo";
import { entries } from "./graphql/queries";
import { createEntry } from "./graphql/mutations";
import flowright from "lodash.flowright";
import CalorieBank from "./CalorieBank";

import {
  Button,
  Statistic,
  Header,
  Progress,
  Label,
  Card,
  Input
} from "semantic-ui-react";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

function App({ data, client, createEntry }) {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("signin");
  const [user, setUser] = useState(null);

  const checkSession = () => {
    Auth.currentSession()
      .then(data => {
        console.log(data);
        setView("caloriebank");
      })
      .catch(err => console.log(err));
  };

  const signOut = () => {
    Auth.signOut({ global: true })
      .then(data => setView("signin"))
      .catch(err => console.log(err));
  };

  const loginSubmit = () => {
    Auth.signIn({
      username, // Required, the username
      password // Optional, the password
    })
      .then(user => {
        setUser(user);
        setView("caloriebank");
      })
      .catch(err => setError(err.message));
  };

  const signUpSubmit = () => {
    Auth.signUp({
      username,
      password,
      attributes: {
        email: username
      }
    })
      .then(data => {
        setError(null);
        setView("confirmation");
      })
      .catch(err => setError(err.message));
  };

  const confirmEmail = () => {
    Auth.confirmSignUp(username, confirmationCode, {
      // Optional. Force user confirmation irrespective of existing alias. By default set to True.
    })
      .then(data => {
        setError(null);
        setView("confirmed");
      })
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="App">
      {view !== "caloriebank" && (
        <Header className="App-header" textAlign="center" as={"h1"}>
          The Calorie Bank
        </Header>
      )}
      {view === "signin" && (
        <Card>
          <Card.Content class="center aligned">
            <h2> Sign In</h2>
            {error && <div className={"errorMessage"}>{error}</div>}
            <Input
              focus
              onChange={e => {
                setUsername(e.target.value);
              }}
              placeholder="Username..."
            />
            <Input
              focus
              type={"password"}
              onChange={e => {
                setPassword(e.target.value);
              }}
              placeholder="Password..."
            />
            <Button onClick={loginSubmit}>Login</Button>
            <div onClick={() => setView("signup")}>Click Here To Sign Up</div>
          </Card.Content>
        </Card>
      )}

      {view === "signup" && (
        <Card>
          <Card.Content class="center aligned">
            <h2> Sign Up</h2>
            {error && <div className={"errorMessage"}>{error}</div>}
            <Input
              focus
              onChange={e => {
                setUsername(e.target.value);
              }}
              placeholder="Username..."
            />
            <Input
              focus
              type={"password"}
              onChange={e => {
                setPassword(e.target.value);
              }}
              placeholder="Password..."
            />
            <Button onClick={signUpSubmit}>Sign Up</Button>
          </Card.Content>
        </Card>
      )}

      {view === "confirmation" && (
        <Card>
          <Card.Content class="center aligned">
            <h2>
              We just sent a confirmation code to your email. Paste it below to
              confirm your account:
            </h2>
            {error && <div className={"errorMessage"}>{error}</div>}

            <Input
              focus
              onChange={e => {
                setConfirmationCode(e.target.value);
              }}
              placeholder="Confirmation Code..."
            />
            <Button onClick={confirmEmail}>Confirm</Button>
          </Card.Content>
        </Card>
      )}

      {view === "confirmed" && (
        <Card>
          <Card.Content class="center aligned">
            <h2>Account Confirmed. Click Below To Sign In</h2>
            <Button onClick={() => setView("signin")}>Sign In</Button>
          </Card.Content>
        </Card>
      )}

      {view === "caloriebank" && (
        <CalorieBank user={user} onSignOut={() => signOut()} />
      )}
    </div>
  );
}

export default App;
