import React, { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import logo from "./logo.svg";
import "./App.css";
import awsmobile from "./aws-exports";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { graphql, compose, withApollo, ApolloProvider } from "react-apollo";
import { entries } from "./graphql/queries";
import { createEntry } from "./graphql/mutations";
import flowright from "lodash.flowright";
import {
  Button,
  Statistic,
  Header,
  Progress,
  Label,
  Card,
  Grid
} from "semantic-ui-react";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

function App({ data, client, createEntry, onSignOut }) {
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    function getMonday(d) {
      d = new Date(d);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0));
    }
    const test = data.items.filter(x => {
      const dat = new Date(x.publishedAt);
      const datee = getMonday(new Date());

      return dat.getTime() > datee.getTime();
    });

    setFilteredData(test);
  }, [data]);

  const profile = {
    sex: "male",
    current_weight: 248, //lbs
    starting_weight: 253,
    goal_weight: 210,
    age: 29,
    height: 187.96, //cm
    lifestyle: 0
  };
  const currentWeightInKg = profile.current_weight / 2.2;
  let bmrCalories = 0;

  if (profile.sex === "male") {
    bmrCalories =
      88.362 +
      13.397 * currentWeightInKg +
      4.799 * profile.height -
      5.677 * profile.age;
  }

  if (profile.sex === "female") {
    bmrCalories =
      447.593 +
      9.247 * currentWeightInKg +
      3.098 * profile.height -
      4.33 * profile.age;
  }

  // addition of cals for active lifestyle
  // 0 = not very active
  // 1 = mod active
  // 2  = very active
  const activeCals = [0.1, 0.15, 0.2];

  bmrCalories = bmrCalories + bmrCalories * activeCals[profile.lifestyle];

  const [display, setDisplay] = useState(true);
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const secondsInADay = 86400;

  const onePoundCals = 3500;
  const weeklyDeficitGoal = onePoundCals * 1;
  const calorieGainPerSecond = bmrCalories / secondsInADay;
  const dailyDeficit = weeklyDeficitGoal / 7;
  const calorieGainPerSecondWithDeficit =
    (bmrCalories - dailyDeficit) / secondsInADay;

  const currentWeightLoss = (
    profile.starting_weight - profile.current_weight
  ).toFixed(1);
  const initialWeightGap = profile.starting_weight - profile.goal_weight;

  const longTermGoalDate = new Date("05/10/2020");

  const poundsToLose = profile.current_weight - profile.goal_weight;

  const currentDate = new Date();
  const Difference_In_Time = longTermGoalDate.getTime() - currentDate.getTime();
  const daysBetweenNowAndGoal = Difference_In_Time / (1000 * 3600 * 24);
  const poundsToLoseEachDay = poundsToLose / daysBetweenNowAndGoal;
  const cals = poundsToLoseEachDay * 3500;

  // Initial start time
  const dateWhenAppOpened = new Date();
  const dayOfWeek = dateWhenAppOpened.getDay();
  const day = dayOfWeek !== 0 ? dayOfWeek : 7;
  const weekProgressLine = (day / 7) * 100;

  const getUpdatedCaloricDifference = () => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const day = dayOfWeek !== 0 ? dayOfWeek : 7;
    if (!filteredData) {
      return;
    }

    const totalConsumedCaloriesWeek = filteredData.reduce(
      (accumulator, currentValue) => accumulator + currentValue.difference,
      0
    );

    const currentTimeInSeconds =
      date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours());
    const totalCurrentSecondsThisWeek =
      currentTimeInSeconds + (day - 1) * secondsInADay;
    const caloriesThisWeek = totalCurrentSecondsThisWeek * calorieGainPerSecond;
    const earnedCaloriesWithDeficit =
      totalCurrentSecondsThisWeek * calorieGainPerSecondWithDeficit;

    const weekly = (
      Math.round((caloriesThisWeek - totalConsumedCaloriesWeek) * 100) / 100
    ).toFixed(0);

    const longTerm = (
      Math.round(daysBetweenNowAndGoal * -totalConsumedCaloriesWeek * 100) / 100
    ).toFixed(2);

    const calorieBank = (
      Math.round(
        (earnedCaloriesWithDeficit - totalConsumedCaloriesWeek) * 100
      ) / 100
    ).toFixed(2);

    setDisplay(calorieBank);

    setWeeklyGoalProgress((weekly / weeklyDeficitGoal) * 100);
    setWeeklyTotal(weekly);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getUpdatedCaloricDifference();
    }, 1000);
    return () => clearInterval(interval);
  }, [filteredData]);

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

  useEffect(() => {
    handleSync();
  }, []);

  return (
    <div className="App">
      <div onClick={() => onSignOut()}>Click here to log out </div>
      <Header className="App-header" textAlign="center" as={"h1"}>
        The Calorie Bank
      </Header>

      <Card>
        <Card.Content class="center aligned">
          {weeklyTotal > weekProgressLine && (
            <Label as="a" color="red" ribbon>
              Killing It!
            </Label>
          )}
          {weeklyTotal < weekProgressLine && weeklyTotal !== 0 && (
            <Label as="a" color="orange" ribbon>
              Try Harder!
            </Label>
          )}
          <Card.Header>Lee</Card.Header>
          <Statistic value={display} />
          <Card.Meta>
            <span className="date">Started Dec 1st 2019</span>
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Label>
            Calorie Gain
            <Label.Detail>
              {(calorieGainPerSecondWithDeficit * 60 * 60).toFixed(2) +
                `cals/hr`}
            </Label.Detail>
          </Label>
          <Label>
            Current Weight
            <Label.Detail>{profile.current_weight + `lbs`}</Label.Detail>
          </Label>
        </Card.Content>
      </Card>

      {/* <LineChart
        width={500}
        height={300}
        data={testter}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart> */}

      <Card>
        <Card.Content class="center aligned">
          <Grid divided="vertically">
            <Grid.Row columns={2}>
              <Grid.Column>
                <h4>Withdraw Calories</h4>
                <Button.Group vertical>
                  <Button
                    onClick={() => {
                      createEntry({ difference: 50 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    - 50 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: 100 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    - 100 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: 200 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    - 200 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: 300 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    - 300 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: 400 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    - 400 cals
                  </Button>
                </Button.Group>
              </Grid.Column>
              <Grid.Column>
                <h4>Deposit Calories</h4>
                <Button.Group vertical>
                  <Button
                    onClick={() => {
                      createEntry({ difference: -50 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    + 50 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: -100 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    + 100 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: -200 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    + 200 cals
                  </Button>
                  <Button
                    onClick={() => {
                      createEntry({ difference: -300 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    + 300 cals
                  </Button>

                  <Button
                    onClick={() => {
                      createEntry({ difference: -400 });

                      // I know I don't like this either
                      setTimeout(() => handleSync(), 1000);
                    }}
                  >
                    + 400 cals
                  </Button>
                </Button.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content class="center aligned">
          <h3>{`Weekly Deficit Goal : ${weeklyTotal}/${weeklyDeficitGoal} cals`}</h3>

          <Progress percent={weeklyGoalProgress} indicating>
            <div className="progress-day" style={pStyle}></div>
          </Progress>

          <h3>{`Weight Loss Goal : ${currentWeightLoss}/${initialWeightGap}lbs`}</h3>
          <Progress
            percent={(currentWeightLoss / initialWeightGap) * 100}
            success
          ></Progress>
          <Label>
            Starting Weight
            <Label.Detail>{profile.starting_weight + `lbs`}</Label.Detail>
          </Label>
          <Label>
            Goal Weight
            <Label.Detail>{profile.goal_weight + `lbs`}</Label.Detail>
          </Label>
        </Card.Content>
      </Card>
    </div>
  );
}

const Test = withApollo(
  flowright(
    graphql(entries, {
      props: ({ data: { listEntry2S = { items: [] } } }) => ({
        data: listEntry2S
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

const WithProvider = props => (
  <ApolloProvider client={client}>
    <Test {...props} />
  </ApolloProvider>
);

export default WithProvider;
