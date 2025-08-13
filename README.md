This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Blockchain Integration

This project integrates with the Lisk Sepolia testnet to securely store SOS alert metadata on the blockchain. The integration ensures that critical alert information (ID, timestamp, and location) is immutably recorded.

### Setup Blockchain Integration

1. Configure your environment variables in `.env` file:
   ```
   PRIVATE_KEY=your_wallet_private_key
   LISK_SEPOLIA_RPC_URL=https://rpc.sepolia-api.lisk.com
   SOS_ALERT_REGISTRY_ADDRESS=your_deployed_contract_address
   ```

2. Compile the smart contracts:
   ```bash
   npm run contracts:compile
   ```

3. Deploy to Lisk Sepolia testnet:
   ```bash
   npm run contracts:deploy:lisk
   ```

4. Test the blockchain integration:
   ```bash
   npm run test:blockchain
   ```

### How It Works

When an SOS alert is created:
1. The system generates a unique alert ID
2. The current timestamp is recorded
3. The geolocation (latitude/longitude) is hashed for privacy
4. These three pieces of data are written to the `SOSAlertRegistry` smart contract on Lisk Sepolia
5. The transaction hash is stored in the database for reference

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
