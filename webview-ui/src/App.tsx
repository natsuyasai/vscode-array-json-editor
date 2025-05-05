import { vscode } from "./utilities/vscode";
import { VscodeButton } from "@vscode-elements/react-elements";
import "./App.css";
import { useState } from "react";

function App() {
  const [jsonText, setJsonText] = useState("");
  const [jsonObject, setJsonObject] = useState({});

  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data that the extension sent
    console.log("Received message from extension:", message);

    switch (message.type) {
      case "init":
      case "update":
        console.log(message.text); // Handle the message from the extension
        setJsonText(message.text);
        setJsonObject(JSON.parse(message.text));
        break;
      default:
        console.log("Unknown command: " + message.command);
        break;
    }
  });

  function handleSave() {
    vscode.postMessage({
      command: "save",
      text: jsonText,
    });
  }

  return (
    <main>
      <p>{jsonText}</p>
      <VscodeButton onClick={handleSave}>Save</VscodeButton>
    </main>
  );
}

export default App;
