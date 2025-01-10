# KoinX Backend

KoinX Backend is a Node.js application that fetches and stores real-time cryptocurrency data for Bitcoin, Matic, and Ethereum. It provides APIs for retrieving the latest stats and calculating price deviations for these cryptocurrencies.

## Features

- **Background Job**: Fetches cryptocurrency data (price, market cap, and 24-hour change) from the CoinGecko API every 2 hours and stores it in MongoDB.
- **/stats API**: Retrieves the latest price, market cap, and 24-hour change for a specified cryptocurrency.
- **/deviation API**: Calculates the standard deviation of the price for the last 100 records of a given cryptocurrency.

## API Endpoints
1. **/stats** - *Get the latest cryptocurrency data*

Endpoint: /stats
Method: GET
Query Parameters:
coin (required): The cryptocurrency to fetch data for. Options: bitcoin, matic, ethereum.

Example Request:
GET https://koinx-qx43.onrender.com/stats?coin=bitcoin

Sample Response:
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
Description: This endpoint returns the most recent data for a specified cryptocurrency, including its price in USD, market cap in USD, and the 24-hour change in percentage.

2. **/deviation** - *Get the price deviation for the last 100 records*

Endpoint: /deviation
Method: GET
Query Parameters:
coin (required): The cryptocurrency to fetch data for. Options: bitcoin, matic, ethereum.

Example Request:
GET https://koinx-qx43.onrender.com/deviation?coin=matic-network

Sample Response:
{
  "deviation": 4082.48
}
Description: This endpoint calculates the standard deviation of the price of the requested cryptocurrency based on the last 100 records stored in the database.
