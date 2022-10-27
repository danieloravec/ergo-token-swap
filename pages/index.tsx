import { buildTxExample } from "../ergo/transactions";

export default function Home() {

  const handleSubmit = async () => {
    await buildTxExample();
  }

  return (
    <div>
      <h1>yeee</h1>
      <button onClick={handleSubmit}>test</button>
    </div>
  )
}
