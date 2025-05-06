import { vscode } from "./utilities/vscode";
import { VscodeButton, VscodeDivider } from "@vscode-elements/react-elements";
import styles from "./App.module.scss";
import { useCallback, useEffect, useState } from "react";
import { UpdateMessage, Message } from "@message/messageTypeToWebview";
import { EditTable } from "./components/EditTable";

function App() {
  const [jsonText, setJsonText] = useState("");
  const [jsonObject, setJsonObject] = useState({});

  const handleMessagesFromExtension = useCallback(
    (event: MessageEvent<Message>) => {
      if (event.data.type === "update") {
        const message = event.data as UpdateMessage;
        setJsonText(message.payload);
      }
    },
    [jsonText]
  );
  useEffect(() => {
    window.addEventListener("message", (event: MessageEvent<Message>) => {
      handleMessagesFromExtension(event);
    });

    return () => {
      window.removeEventListener("message", handleMessagesFromExtension);
    };
  }, [handleMessagesFromExtension]);

  const handleReloadWebview = () => {
    vscode.postMessage({
      type: "reload",
      payload: jsonText,
    });
  };

  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data that the extension sent
    console.log("Received message from extension:", message);

    switch (message.type) {
      case "init":
      case "update":
        const updateMessage = message as UpdateMessage;
        console.log(updateMessage.payload); // Handle the message from the extension
        setJsonText(updateMessage.payload);
        setJsonObject(JSON.parse(updateMessage.payload));
        break;
      default:
        console.log("Unknown command: " + message.command);
        break;
    }
  });

  function handleSave() {
    vscode.postMessage({
      type: "save",
      payload: JSON.stringify(jsonObject, null, 2),
    });
  }

  return (
    <main className={styles.main}>
      <EditTable jsonObject={jsonObject} setJsonObject={() => {}}></EditTable>
      <VscodeDivider className={styles.divider} />
      <VscodeButton onClick={handleSave}>Save</VscodeButton>
    </main>
  );
}

export default App;
