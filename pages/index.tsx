import { buildTxExample } from "../ergo/transactions";
import { Wallet } from "../ergo/wallet";

export default function Home() {

  const handleSubmit = async () => {
    const wallet = new Wallet();
    await buildTxExample(wallet);
  }

  return (
    <div>
      <h1>yeee</h1>
      <button onClick={handleSubmit}>test</button>
    </div>
  )
}
