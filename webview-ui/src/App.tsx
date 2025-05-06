import { vscode } from "./utilities/vscode";
import { VscodeButton, VscodeDivider } from "@vscode-elements/react-elements";
import styles from "./App.module.scss";
import { useCallback, useEffect, useState } from "react";
import { UpdateMessage, Message } from "@message/messageTypeToWebview";
import { EditableTableRoot } from "./components/EditableTableRoot";

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
        setJsonText(updateMessage.payload);
        setJsonObject(JSON.parse(updateMessage.payload));
        break;
      default:
        console.log("Unknown command: " + message.command);
        break;
    }
  });

  function handleApply() {
    vscode.postMessage({
      type: "save",
      payload: JSON.stringify(jsonObject, null, 2),
    });
  }

  function updateJsonObject(newJsonObject: Record<string, any>) {
    setJsonObject(newJsonObject);
    setJsonText(JSON.stringify(newJsonObject, null, 2));
  }

  return (
    <main className={styles.main}>
      <EditableTableRoot
        jsonObject={jsonObject}
        setJsonObject={updateJsonObject}></EditableTableRoot>
      <VscodeDivider className={styles.divider} />
      <div className={styles.footer}>
        <VscodeButton className={styles.applyButton} onClick={handleApply}>
          Apply
        </VscodeButton>
      </div>
    </main>
  );
}

export default App;
