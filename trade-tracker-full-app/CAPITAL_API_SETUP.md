# Capital.com API Integration Documentation

## Overview

This document details the integration with Capital.com's API for the trading bot application. The integration enables real-time market data streaming, historical data fetching, and trading capabilities through Capital.com's demo API environment.

## API Credentials Setup

### Required Environment Variables

```env
CAPITAL_API_KEY=your_api_key
CAPITAL_IDENTIFIER=your_identifier
CAPITAL_PASSWORD=your_password
```

### API Endpoints

The base URL for the demo environment is:

```
https://demo-api-capital.backend-capital.com
```

Key endpoints used:

- Session: `/api/v1/session`
- Prices: `/api/v1/prices`
- Instruments: `/api/v1/instruments`
- Market Status: `/api/v1/market-status`

## Authentication Flow

1. **Session Creation**

```typescript
// Create a session with Capital.com API
const response = await axios.post(
  `${CAPITAL_API.BASE_URL}${CAPITAL_API.SESSION}`,
  {
    identifier: CAPITAL_IDENTIFIER,
    password: CAPITAL_PASSWORD,
    encryptedPassword: false,
  },
  {
    headers: {
      'X-CAP-API-KEY': CAPITAL_API_KEY,
      'Content-Type': 'application/json',
    },
  }
);

// Store session tokens
const sessionTokens = {
  CST: response.headers['cst'],
  X-SECURITY-TOKEN: response.headers['x-security-token']
};
```

2. **Session Management**

- Sessions are automatically managed with token refresh
- The system maintains session state and handles re-authentication when needed
- Session tokens are required for all subsequent API calls

## Data Fetching

### Historical Data

```typescript
// Fetch historical price data
const data = await getHistoricalData(
  symbol, // e.g., "EUR/USD"
  timeframe, // e.g., "MINUTE_15"
  limit // e.g., 200
);
```

Supported timeframes:

- MINUTE
- MINUTE_5
- MINUTE_15
- MINUTE_30
- HOUR
- HOUR_4
- DAY
- WEEK

### Real-time Data Streaming

1. **WebSocket Connection**

```typescript
const ws = new WebSocket("wss://api-streaming-capital.backend-capital.com/connect");
```

2. **Subscription Message Format**

```typescript
const subscribeMessage = {
  destination: "OHLCMarketData.subscribe",
  correlationId: Date.now().toString(),
  cst: sessionTokens.CST,
  securityToken: sessionTokens.X_SECURITY_TOKEN,
  payload: {
    epics: [epic],
    resolutions: ["MINUTE"],
    type: "classic",
  },
};
```

3. **Handling Updates**

```typescript
ws.on("message", async (data) => {
  const message = JSON.parse(data.toString());
  if (message.destination === "ohlc.event" && message.status === "OK") {
    const bar = message.payload;
    // Process real-time price update
  }
});
```

## Implementation Details

### Price Data Structure

```typescript
interface Bar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Error Handling

The implementation includes comprehensive error handling:

- Session expiration and renewal
- Network connectivity issues
- Invalid data format
- Rate limiting

### Keep-Alive Mechanism

```typescript
// Send ping every 5 minutes to keep connection alive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        destination: "ping",
        correlationId: Date.now().toString(),
        cst: sessionTokens.CST,
        securityToken: sessionTokens.X_SECURITY_TOKEN,
      })
    );
  }
}, 5 * 60 * 1000);
```

## Frontend Integration

### Chart Component

The `EURUSDCard` component uses the Capital.com API to:

1. Fetch historical data for initial chart rendering
2. Maintain real-time updates every 15 seconds
3. Display OHLC candlesticks and technical indicators

Example API call:

```typescript
const response = await axios.get(`/api/bars/EURUSD`, {
  params: {
    timeframe: "HOUR",
    limit: 200,
    source: "capital",
  },
});
```

### Data Processing

1. Convert timestamps to UNIX format for chart library
2. Sort data in ascending order by time
3. Calculate technical indicators (SMA, RSI, MACD)
4. Update chart series with new data

## Best Practices

1. **Rate Limiting**

   - Implement appropriate delays between API calls
   - Use websocket for real-time data instead of polling when possible

2. **Error Recovery**

   - Implement exponential backoff for retries
   - Maximum 3 retry attempts before failing
   - Proper error logging and monitoring

3. **Session Management**

   - Store session tokens securely
   - Implement automatic session renewal
   - Handle session expiration gracefully

4. **Data Validation**
   - Validate all incoming data
   - Handle missing or malformed data gracefully
   - Implement proper type checking

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**

   - Verify API credentials are correct
   - Check if session tokens are present and valid
   - Ensure proper headers are set for all requests

2. **Data Streaming Issues**

   - Check WebSocket connection status
   - Verify subscription message format
   - Ensure proper handling of connection drops

3. **Rate Limiting**
   - Implement proper delays between requests
   - Use batch requests when possible
   - Monitor API usage and implement throttling

## Security Considerations

1. **API Credentials**

   - Store credentials in environment variables
   - Never expose credentials in client-side code
   - Use secure methods for credential transmission

2. **Session Management**

   - Implement proper session timeout handling
   - Secure storage of session tokens
   - Regular session rotation

3. **Data Protection**
   - Implement proper data encryption
   - Secure storage of sensitive information
   - Regular security audits
