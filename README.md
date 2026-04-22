# Genesis for baengpun chain

## Initializing the genesis block

```bash
git clone https://github.com/padillareyj/baengpun-chain
geth init --datadir baengpun-chain baengpun-chain/genesis.json
```

## Running the node

```bash
geth --datadir baengpun-chain --networkid 123454321 --nat extip:[IP-ADDRESS] --unlock [ACCOUNT] --password [password-for-keystore]
```

For example:

```bash
geth --datadir baengpun-chain --networkid 123454321 --nat extip:203.159.31.128 --unlock 0xCb1C9E26a6B65f35AC6F953aA453187daFe02422 --password password.txt
```

## Running the node with mining (PoA)

```bash
geth --datadir baengpun-chain --networkid 123454321 --nat extip:[IP-ADDRESS] --unlock [ACCOUNT] --password [password-for-keystore] --mine --miner.etherbase [ACCOUNT]
```

For example:

```bash
geth --datadir baengpun-chain --networkid 123454321 --nat extip:203.159.31.128 --unlock 0xCb1C9E26a6B65f35AC6F953aA453187daFe02422 --password password.txt --mine --miner.etherbase 0xCb1C9E26a6B65f35AC6F953aA453187daFe02422
```

## Joining the network

1. Copy the `genesis.json` file.
2. Create an account to run the node (take note of the public address):

```bash
geth account new --datadir data
geth init --datadir data genesis.json
```

3. Save password to `password.txt`.
4. Run the node with:

```bash
geth --datadir data --networkid 123454321 --unlock [Public Address] --password password.txt --bootnodes [Bootnode enode address] --http --http.port 8552 --http.addr 203.159.31.131 --http.api eth,net,web3,debug --allow-insecure-unlock
```

For example:

```bash
geth --datadir data --networkid 123454321 --nat extip:203.159.31.131 --unlock 0x3Eb0861d4cD52048D7570EF4733936cD94Bf00Bd --password password.txt --bootnodes enode://bde83bf822316dae4d659d1380de4645747e2979745c4c9c14ffd9a9fad6b450c52eb83dc167a44c3904e59f5391bfd274b1e8496dc454d9285a2061f8946d1b@203.159.31.128:30303 --authrpc.port 8553 --http --http.port 8552 --http.addr 203.159.31.131 --http.api eth,net,web3,debug --allow-insecure-unlock
```

## Troubleshooting Connection Issues

If MetaMask shows "Unable to connect" or the website says "Please install MetaMask", follow these steps:

### 1. Fix the "Please install MetaMask" message
Browsers block MetaMask from interacting with files opened directly (e.g., `file:///C:/...`).
*   **Run a Local Server**: Open PowerShell in this folder and run `npx http-server .` then go to `http://localhost:8080`.
*   **OR Allow File Access**: Go to Chrome Extensions > MetaMask > Details > Enable "Allow access to file URLs".

### 2. Fix "Unable to connect to network"
If you are on a restricted network (like School Wi-Fi), it may block the port `8552`.
*   **Use Localhost**: Ensure your Geth node is running on your machine and use `http://127.0.0.1:8552` as the RPC URL in MetaMask.
*   **Enable CORS**: Always start Geth with `--http.corsdomain "*"` or MetaMask will be blocked by security policies.

### 3. Exact PowerShell Command to Start Node
Copy and paste this into PowerShell if `geth` is not in your path:
```powershell
& "C:\Program Files (x86)\Geth\geth.exe" --datadir . --networkid 123454321 --http --http.port 8552 --http.addr 0.0.0.0 --http.api eth,net,web3,debug --http.corsdomain "*" --allow-insecure-unlock
```

---

## Quick Start Guide

Once your node is running and MetaMask is connected:

### Step 1: Connect the Website
```bash
npx http-server . -p 8080 .

& "C:\Program Files (x86)\Geth\geth.exe" --datadir . --networkid 123454321 --http --http.port 8552 --http.addr 0.0.0.0 --http.api eth,net,web3,debug --http.corsdomain "*" --allow-insecure-unlock

```
1. Access the app via `http://localhost:8080`.
2. Click **Connect MetaMask**.
3. Confirm the popup. You should see "Wallet Connected".

### Step 2: Phase A (The Stamper)
1. Enter your data (e.g., a serial number) in the box.
2. Click **Stamp to Blockchain**.
3. Confirm the transaction in MetaMask.
4. **Copy the Transaction Hash** that appears once confirmed.

### Step 3: Phase B (The Verifier)
1. Paste your Transaction Hash into the search box.
2. Click **Verify Data**.
3. The app will decode and display the original data from the blockchain.

> [!IMPORTANT]
> **Account Balance**: You must have some ETH (or ilabcoin) in your account to stamp data. If your balance is 0, start Geth with `--mine` and a valid etherbase to generate coins, or request some from the network admin.
