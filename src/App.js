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
import {
  Input,
  Button,
  Statistic,
  Header,
  Progress,
  Dimmer,
  Loader
} from "semantic-ui-react";

function App({ data, client, createEntry }) {
  const [difference, setDifference] = useState();
  const [display, setDisplay] = useState(true);
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const secondsInADay = 86400;
  const BmrCalories = 2613;
  const weeklyDeficitGoal = 3500;
  const calorieGainPerSecond = BmrCalories / secondsInADay;

  // Initial start time
  const dateWhenAppOpened = new Date();
  const dayOfWeek = dateWhenAppOpened.getDay();

  const weekProgressLine = (dayOfWeek / 7) * 100;

  const getUpdatedCaloricDifference = () => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const number = data.items.reduce(
      (accumulator, currentValue) => accumulator + currentValue.difference,
      0
    );

    const secondsInToday =
      date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours());
    const totalCurrentSecondsThisWeek =
      secondsInToday + (dayOfWeek - 1) * secondsInADay;
    const caloriesThisWeek = totalCurrentSecondsThisWeek * calorieGainPerSecond;
    const display = (
      Math.round((caloriesThisWeek - number) * 100) / 100
    ).toFixed(2);

    setDisplay(display);

    setWeeklyGoalProgress((display / weeklyDeficitGoal) * 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getUpdatedCaloricDifference();
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleSync = async () => {
    setLoading(true);

    const test = await client.query({
      query: entries,
      fetchPolicy: "network-only"
    });

    setLoading(false);
  };

  const pStyle = {
    left: `${weekProgressLine}%`
  };

  return (
    <div className="App">
      <Header className="App-header" textAlign="center">
        <Statistic label="Weekly Caloric Deficit" as={"h2"} value={display} />
      </Header>
      <div class="icon center aligned header">
        <Input
          focus
          placeholder="Add Calories..."
          onChange={val => {
            setDifference(val.target.value);
          }}
        />
        <Button
          onClick={() => {
            createEntry({ difference });

            // I know I don't like this either
            setTimeout(() => handleSync(), 1000);
          }}
        >
          Submit
        </Button>
      </div>
      <h2>{`Weekly Goal : ${weeklyDeficitGoal} cals`}</h2>
      <Progress percent={weeklyGoalProgress} indicating>
        <div className="progress-day" style={pStyle}></div>
      </Progress>
    </div>
  );
}

const Test = withApollo(
  flowright(
    graphql(entries, {
      options: {
        fetchPolicy: "network-only"
      },
      props: ({ data: { listEntries = { items: [] } } }) => ({
        data: listEntries
      })
    }),
    graphql(createEntry, {
      options: {
        update: (proxy, { data: { createEntry } }) => {}
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
