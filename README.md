
# VoteChain 2025 — End-to-End E-Voting (Foundry + React)

Secure, transparent on-chain voting for a national-scale election prototype. The dApp lets citizens register, parties nominate, an admin approve on-chain, and voters cast irreversible votes that anyone can tally from the Ballot contract.

## What this project does

- Citizens submit voter info; an admin registers/approves them on-chain in `UserRegistry`.
- Parties submit nominations; an admin registers/approves them on-chain in `PartyRegistry`.
- Approved voters can cast a single vote for an approved party via `Ballot`; votes are recorded on-chain and exposed through `voteCount`.
- The React frontend (Vite + wagmi + viem) handles wallet connect, queues, admin approvals, and live results.

## Tech stack & prerequisites

- Foundry (forge, anvil, cast) — Solidity toolchain and local devnet.
- Node.js 18+ and npm — frontend build and wagmi/viem client.
- MetaMask (or any EIP-1193 wallet) — connect to Anvil (chainId 31337).
- React + Vite — frontend runtime/bundler.
- wagmi + viem — wallet connection and contract reads/writes.
- Solidity ^0.8.20 — smart contracts.

## Contract overview (core logic)

- `UserRegistry`
  - `registerAsVoter(address voter, string name, string email, string phone, string nid)` — admin-only, creates an approved voter record.
  - `approveUser(address voter)` — admin-only status change.
  - `isApproved(address voter) -> bool` — gating check for Ballot.
- `PartyRegistry`
  - `registerAsParty(address party, string name, string regNumber)` — admin-only, approves a party.
  - `approveParty(address party)` — admin-only pending -> approved.
  - `isApproved(address party) -> bool` — used by Ballot.
- `Ballot`
  - `vote(address party)` — requires caller is approved voter, party is approved, and caller has not voted; emits `VoteCast` and increments `voteCount[party]`.
  - `voteCount(address party) -> uint256` — public tally per party.

Current local deployment addresses (Anvil 31337, from latest `forge script` run):

- `UserRegistry`: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- `PartyRegistry`: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- `Ballot`: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- Admin wallet (Anvil default #0): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  Update `frontend/src/constants.js` if you redeploy.

## How the app flows

1. Voter submits details in the UI → stored in localStorage as a pending request.
2. Admin approves voters via Admin Portal → calls `registerAsVoter` on-chain; status flips to approved when the tx confirms.
3. Party submits nomination → stored locally; admin registers via `registerAsParty`.
4. Approved voter connects wallet → UI unlocks Ballot → calls `vote(partyAddress)` on `Ballot`.
5. Results view reads `voteCount` for each party using viem `readContract` and displays totals.

## Local dev environment

```bash
# 1) Install Foundry (if needed)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```
```
# 2) Install JS deps
cd frontend
npm install
```
```
# 3) Start local chain
anvil
```
```
foundry build
```
```
# 5) In a new shell, deploy contracts to Anvil
cd e:/Blockchain/evoting
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```
```
# 6) Run the frontend (with LAN access for wallets)
cd frontend
npm run dev -- --host
```

MetaMask setup

- Add network: RPC `http://127.0.0.1:8545`, Chain ID `31337`, Currency `ETH`.
- Import Anvil default private key (account #0) for admin: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (dev only).
- Use other Anvil accounts as voters/parties.

## Foundry essentials (used here)

- Build: `forge build`
- Tests: `forge test`
- Format: `forge fmt`
- Gas snapshot: `forge snapshot`
- Local node: `anvil`
- Deploy to Anvil: `forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast`
- Cast example (read storage/call): `cast call <addr> "voteCount(address)" <party>`
  Docs: https://book.getfoundry.sh/

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.


## Frontend stack details

- React + Vite for fast HMR and JSX.
- wagmi for wallet connectors/hooks (`useAccount`, `useWriteContract`, `useWaitForTransactionReceipt`).
- viem for RPC reads (`readContract`) against Ballot and registries.
- lucide-react for icons; Tailwind-like utility classes for styling.

Key components

- `App.jsx` — routing between Voter / Party / Admin / Results views and wallet connect.
- `RegisterVoter.jsx` / `RegisterParty.jsx` — collect info, queue in localStorage.
- `AdminPanel.jsx` + `VoterQueue.jsx` / `PartyQueue.jsx` — admin approvals that trigger on-chain writes.
- `VotingBallot.jsx` — approved voter casts `vote` on Ballot.
- `Results.jsx` — viem `readContract` to show `voteCount` per party.

## Deployment to another network

1. Set `--rpc-url` and `--private-key` in the deploy script command for your target chain.
2. Copy new contract addresses into `frontend/src/constants.js`.
3. Point the frontend wallet to that network; restart `npm run dev`.

## Troubleshooting

- `voteCount` reads 0/"no data": ensure contracts are deployed to your active chain and addresses in `frontend/src/constants.js` match the latest deployment.
- Transactions pending forever: confirm wallet is on the same network/chainId as Anvil; check Anvil console for tx logs.
- Admin gate blocking: only wallet equal to `ADMIN_ADDRESS` can approve/register or access Admin Portal.

## References

- Foundry book: https://book.getfoundry.sh/
- wagmi: https://wagmi.sh/
- viem: https://viem.sh/
- Vite: https://vitejs.dev/
- MetaMask local dev: https://docs.metamask.io/
