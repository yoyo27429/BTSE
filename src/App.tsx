import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useWebSocket } from "./useWebsocketHook";

function App() {
  const { messages, sendMessage } = useWebSocket(
    "wss://ws.btse.com/ws/oss/futures"
  ); // 換成你的 WebSocket 伺服器網址
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <div className="border p-2 h-40 overflow-auto bg-gray-100">
          {messages.map((msg, index) => (
            <div key={index} className="p-1">
              {msg}
            </div>
          ))}
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
