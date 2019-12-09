import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import awsmobile from "./aws-exports";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import { graphql, compose, withApollo, ApolloProvider } from "react-apollo";
import { entries } from "./graphql/queries";
import { createEntry } from "./graphql/mutations";
import flowright from "lodash.flowright";

function App({ entries, client }) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {entries.items.map(item => {
          return <div>{item.difference}</div>;
        })}
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}
const Test = withApollo(
  graphql(
    entries,
    {
      options: {
        fetchPolicy: "cache-first"
      },
      props: ({ data: { listEntries = { items: [] } } }) => ({
        entries: listEntries
      })
    }
    // graphql(createEntry, {
    //   props: props => ({
    //     createEntry: event => {
    //       return props.mutate({
    //         variables: { id: event.id },
    //         optimisticResponse: () => ({
    //           createEntry: {
    //             ...event,
    //             __typename: "Event",
    //             comments: { __typename: "CommentConnection", items: [] }
    //           }
    //         })
    //       });
    //     }
    //   })
    // })
  )(App)
);

const client = new AWSAppSyncClient({
  url: awsmobile.aws_appsync_graphqlEndpoint,
  region: awsmobile.aws_appsync_region,
  auth: {
    type: awsmobile.aws_appsync_authenticationType,
    apiKey: awsmobile.aws_appsync_apiKey
  }
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Test />
  </ApolloProvider>
);

export default WithProvider;
