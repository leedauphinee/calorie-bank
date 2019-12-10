import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import awsmobile from "./aws-exports";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";
import { graphql, compose, withApollo, ApolloProvider } from "react-apollo";
import { entries } from "./graphql/queries";
import { createEntry } from "./graphql/mutations";
import flowright from "lodash.flowright";
import { Input, Button, Statistic, Loader, Dimmer } from "semantic-ui-react";

function App({ entries, client, createEntry }) {
  const [difference, setDifference] = useState();
  const [display, setDisplay] = useState(true);

  const secondsInADay = 86400;
  const BmrCalories = 2613;
  const calorieGainPerSecond = BmrCalories / secondsInADay;

  const test = () => {
    const number = entries.items.reduce(
      (accumulator, currentValue) => accumulator + currentValue.difference,
      0
    );
    const date = new Date();
    const dayOfWeek = date.getDay();
    const secondsInToday =
      date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours());
    const totalCurrentSecondsThisWeek =
      secondsInToday + (dayOfWeek - 1) * secondsInADay;
    const caloriesThisWeek = totalCurrentSecondsThisWeek * calorieGainPerSecond;
    console.log(caloriesThisWeek, number);
    setDisplay(caloriesThisWeek - number);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      test();
    }, 1000);
    return () => clearInterval(interval);
  }, [entries]);

  return (
    <div className="App">
      <header className="App-header">
        <Statistic label="Weekly Caloric +/-" value={display} />

        <div>Test</div>
        <Input
          focus
          placeholder="Search..."
          onChange={val => {
            setDifference(val.target.value);
          }}
        />
        <Button onClick={() => createEntry({ difference })}>Click Here</Button>
      </header>
    </div>
  );
}
const Test = withApollo(
  flowright(
    graphql(entries, {
      options: {
        fetchPolicy: "cache-first"
      },
      props: ({ data: { listEntries = { items: [] } } }) => ({
        entries: listEntries
      })
    }),
    graphql(createEntry, {
      options: {
        update: (proxy, { data: { createEntry } }) => {
          //proxy.writeQuery({ query, data });
        }
      },
      props: props => ({
        createEntry: entry => {
          const today = new Date();
          return props.mutate({
            variables: {
              difference: entry.difference,
              publishedAt: today.toISOString()
            },
            optimisticResponse: () => ({
              createEntry: {
                ...entry,
                __typename: "Entry",
                comments: { __typename: "EntryConnection", items: [] }
              }
            })
          });
        }
      })
    })
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
