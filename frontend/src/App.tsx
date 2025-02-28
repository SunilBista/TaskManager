import { useState } from "react";
import "./App.css";
import React from "react";

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  return (
    <>
      <p>Current count is {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </>
  );
};

export default App;
