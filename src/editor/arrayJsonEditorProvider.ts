// WebViewの内容を表示するためのクラス
import * as vscode from "vscode";
import { ArrayJsonDocument, ArrayJsonEdit } from "./arrayJsonDocument";
import { WebviewCollection } from "./webviewCollection";
import { disposeAll } from "../util/dispose";
import { getNonce } from "../util/util";
import { Uri } from "vscode";
import { getUri } from "../util/getUri";
import { Message, MessageType, UpdateMessage } from "../message/messageType";

/**
 * Provider for paw draw editors.
 *
 * Paw draw editors are used for `.pawDraw` files, which are just `.png` files with a different file extension.
 *
 * This provider demonstrates:
 *
 * - How to implement a custom editor for binary files.
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Communication between VS Code and the custom editor.
 * - Using CustomDocuments to store information that is shared between multiple custom editors.
 * - Implementing save, undo, redo, and revert.
 * - Backing up a custom editor.
 */
export class ArrayJsonEditorProvider implements vscode.CustomEditorProvider<ArrayJsonDocument> {
  /**
   * Register the editor provider.
   *
   * @param context The extension context.
   * @returns A disposable that unregisters the editor provider.
   */
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    // 現在アクティブなファイルを開くコマンドを登録
    vscode.commands.registerCommand("array-json-editor.openEditor", () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        vscode.window.showErrorMessage("array-json-editor: No active editor.");
        return;
      }
      const uri = activeEditor.document.uri;
      vscode.commands.executeCommand("vscode.openWith", uri, ArrayJsonEditorProvider.viewType);
    });

    return vscode.window.registerCustomEditorProvider(
      ArrayJsonEditorProvider.viewType,
      new ArrayJsonEditorProvider(context),
      {
        webviewOptions: {},
        supportsMultipleEditorsPerDocument: false, // 同一ドキュメントに対して複数のエディタをサポートするかどうか
      }
    );
  }

  // package.jsonのviewTypeと一致させる
  private static readonly viewType = "array-json-editor.openEditor";

  /**
   * Tracks all known webviews
   */
  private readonly webviews = new WebviewCollection();

  constructor(private readonly context: vscode.ExtensionContext) {}

  //#region CustomEditorProvider

  /**
   * Called when our custom editor is opened.
   * 登録している拡張子のファイルを開いたときに呼ばれる
   * コマンドで表示を行った場合もvscode.openWithで実行しているのでこちらが呼ばれる
   *
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        payload: document.getText(),
      } as UpdateMessage);
    }
    // Update the webview when the document changes
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.type as MessageType) {
        case "update":
          return;
        case "save":
          console.log("save", e.payload);
          await vscode.workspace.fs.writeFile(document.uri, Buffer.from(e.payload, "utf-8"));
          return;
        case "reload":
          return;
      }
    });

    updateWebview();
  }

  /**
   * @param uri
   * @param openContext
   * @param _token
   * @returns
   */
  async openCustomDocument(
    uri: vscode.Uri,
    openContext: { backupId?: string },
    _token: vscode.CancellationToken
  ): Promise<ArrayJsonDocument> {
    const document: ArrayJsonDocument = await ArrayJsonDocument.create(uri, openContext.backupId, {
      getFileData: async () => {
        const webviewsForDocument = Array.from(this.webviews.get(document.uri));
        if (!webviewsForDocument.length) {
          throw new Error("Could not find webview to save for");
        }
        const panel = webviewsForDocument[0];
        const response = await this.postMessageWithResponse<number[]>(panel, "getFileData", {});
        return new Uint8Array(response);
      },
    });

    const listeners: vscode.Disposable[] = [];

    listeners.push(
      document.onDidChange((e) => {
        // Tell VS Code that the document has been edited by the use.
        this._onDidChangeCustomDocument.fire({
          document,
          ...e,
        });
      })
    );

    listeners.push(
      document.onDidChangeContent((e) => {
        // Update all webviews when the document changes
        for (const webviewPanel of this.webviews.get(document.uri)) {
          this.postMessage(webviewPanel, "update", {
            edits: e.edits,
            content: e.content,
          });
        }
      })
    );

    document.onDidDispose(() => disposeAll(listeners));

    return document;
  }

  async resolveCustomEditor(
    document: ArrayJsonDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Add the webview to our internal set of active webviews
    this.webviews.add(document.uri, webviewPanel);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage((e) => this.onMessage(document, e));

    // Wait for the webview to be properly ready before we init
    webviewPanel.webview.onDidReceiveMessage((e) => {
      if (e.type === "ready") {
        if (document.uri.scheme === "untitled") {
          this.postMessage(webviewPanel, "init", {
            untitled: true,
            editable: true,
          });
        } else {
          const editable = vscode.workspace.fs.isWritableFileSystem(document.uri.scheme);

          this.postMessage(webviewPanel, "init", {
            value: document.documentData,
            editable,
          });
        }
      }
    });
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<ArrayJsonDocument>
  >();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  public saveCustomDocument(
    document: ArrayJsonDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.save(cancellation);
  }

  public saveCustomDocumentAs(
    document: ArrayJsonDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }

  public revertCustomDocument(
    document: ArrayJsonDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.revert(cancellation);
  }

  public backupCustomDocument(
    document: ArrayJsonDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  //#endregion

  /**
   * Get the static HTML used for in our editor's webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const extensionUri = this.context.extensionUri;
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private _requestId = 1;
  private readonly _callbacks = new Map<number, (response: any) => void>();

  private postMessageWithResponse<R = unknown>(
    panel: vscode.WebviewPanel,
    type: string,
    body: any
  ): Promise<R> {
    const requestId = this._requestId++;
    const p = new Promise<R>((resolve) => this._callbacks.set(requestId, resolve));
    panel.webview.postMessage({ type, requestId, body });
    return p;
  }

  private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {
    panel.webview.postMessage({ type, body });
  }

  private onMessage(document: ArrayJsonDocument, message: any) {
    switch (message.type) {
      case "stroke":
        document.makeEdit(message as ArrayJsonEdit);
        return;

      case "response": {
        const callback = this._callbacks.get(message.requestId);
        callback?.(message.body);
        return;
      }
    }
  }
}
