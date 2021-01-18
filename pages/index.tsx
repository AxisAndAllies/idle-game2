import Layout from "../components/Layout";

import { proxy, useProxy } from "valtio";
import { useEffect, useState } from "react";
import next from "next";

let round3Digits = (n: number) => Math.round(n * 1000) / 1000;

type Upgrade = {
  id: number;
  add: number;
  baseCost: number;
  numOwned: number;
};
const state = proxy({
  count: 0, // current count
  add: 0, // amount per sec added
  // text: "hello",
  resetMult: 1, // cur reset multiplier
  numResets: 0, // reset count
  upgrades: [
    {
      id: 1,
      add: 1,
      baseCost: 4,
      numOwned: 0,
    },
    {
      id: 2,
      add: 5,
      baseCost: 35,
      numOwned: 0,
    },
    {
      id: 3,
      add: 15,
      baseCost: 130,
      numOwned: 0,
    },
    {
      id: 4,
      add: 25,
      baseCost: 370,
      numOwned: 0,
    },
    {
      id: 5,
      add: 48,
      baseCost: 800,
      numOwned: 0,
    },
    {
      id: 6,
      add: 128,
      baseCost: 5000,
      numOwned: 0,
    },
    {
      id: 7,
      add: 600,
      baseCost: 20000,
      numOwned: 0,
    },
  ],
});

// setInterval(() => {
//   ++state.count;
// }, 1000);
const IndexPage = () => {
  const snapshot = useProxy(state);

  const seconds = 1;
  const [isActive, setIsActive] = useState(true);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setIsActive(true);
    state.resetMult = nextResetBonus();
    // reset count and upgrades
    state.count = 0;
    state.add = 0;
    state.upgrades = snapshot.upgrades.map((u) => ({
      ...u,
      numOwned: 0,
    }));
  }

  function realCost({ baseCost, numOwned }: Upgrade) {
    return round3Digits(baseCost * Math.pow(1.1, numOwned));
  }

  function resetBonus(numResets: number, count: number) {
    let m = round3Digits((Math.pow(1.3, numResets) * Math.log(count + 1)) / 5);
    if (m < 1) m = 1;
    return m;
  }

  function nextResetBonus() {
    return resetBonus(snapshot.numResets + 1, snapshot.count);
  }

  function perSec() {
    return snapshot.add * snapshot.resetMult;
  }

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        state.count += perSec() / 10;
      }, (seconds * 1000) / 10);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, snapshot.add, JSON.stringify(snapshot.upgrades)]);

  return (
    <Layout title="Idle away">
      <h1>Idle away</h1>
      <p>
        {/* <Link href="/about">
        <a>About</a>
      </Link> */}
        {round3Digits(snapshot.count)}
        <br></br>({round3Digits(perSec())}/sec)
        <br></br>(x{snapshot.resetMult})
        <div>
          <button onClick={() => ++state.count}>+1</button>
          {/* <button onClick={() => (state.count += 10)}>+10</button> */}
          <button onClick={toggle}>toggle {isActive ? "OFF" : "ON"}</button>
          <button
            onClick={reset}
            disabled={nextResetBonus() <= snapshot.resetMult}
          >
            reset all upgrades AND score to get{" "}
            <strong>x{nextResetBonus()}</strong> multiplier
          </button>
        </div>
        <div>
          {snapshot.upgrades.map((u) => (
            <button
              disabled={state.count < realCost(u)}
              onClick={() => {
                state.add += u.add;
                state.count -= realCost(u);
                let ind = state.upgrades.findIndex((e) => e.id == u.id);
                state.upgrades[ind].numOwned += 1;
              }}
            >
              +{u.add} for ${realCost(u)}
            </button>
          ))}
        </div>
      </p>
    </Layout>
  );
};

export default IndexPage;
