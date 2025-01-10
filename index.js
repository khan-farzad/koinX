require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const { default: axios } = require("axios");

const app = express();
app.use(express.json());
const client = new MongoClient(process.env.MONGODB_URL);

const updateCoinData = async () => {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        headers: `x-cg-demo-api-key: ${process.env.API_KEY}`,
        params: {
          vs_currency: "usd",
          ids: "bitcoin,ethereum,matic-network",
        },
      }
    );

    const coinCollections = await client.db("koinX").collection("coins");

    data.forEach(
      async ({ id, current_price, market_cap, price_change_24h }) => {
        const coinData = await coinCollections.findOne({ coin: id });
        const newPriceHistory = coinData.priceHistory;
        newPriceHistory.push(current_price);
        if (newPriceHistory.length > 100) {
          newPriceHistory.shift();
        }
        await coinCollections.updateOne(
          { coin: id },
          {
            $set: {
              price: current_price,
              marketCap: market_cap,
              "24hChange": price_change_24h,
              priceHistory: newPriceHistory,
            },
          }
        );
      }
    );
  } catch (error) {
    console.log("error in fetching data", error);
  }
};

const fetchCoinData = async (coin) => {
  const coinData = await client
    .db("koinX")
    .collection("coins")
    .findOne({ coin });
  const toSend = {
    price: coinData.price,
    marketCap: coinData.marketCap,
    "24hChange": coinData["24hChange"],
  };
  return toSend;
};

const calculateDeviation = async (coin) => {
  const coinData = await client
    .db("koinX")
    .collection("coins")
    .findOne({ coin });
  const array = coinData.priceHistory;
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return (
    Math.round(
      Math.sqrt(
        array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
      ) * 100
    ) / 100
  );
};

setInterval(updateCoinData, 2 * 60 * 60 * 1000);

const validCoins = ["bitcoin", "ethereum", "matic-network"];

app.get("/stats", async (req, res) => {
  const { coin } = req.query;
  if (!validCoins.includes(coin)) {
    return res.send({
      error: "currently we support bitcoin, ethereum or matic-network",
    });
  }

  const response = await fetchCoinData(coin);
  res.send(response);
});

app.get("/deviation", async (req, res) => {
  const { coin } = req.query;
  if (!validCoins.includes(coin)) {
    return res.send({
      error: "currently we support bitcoin, ethereum or matic-network",
    });
  }

  const response = await calculateDeviation(coin);
  return res.send({ deviation: response });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
