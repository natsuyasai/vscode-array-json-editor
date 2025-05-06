import * as vscode from "vscode";
import { ArrayJsonEditorProvider } from "@/editor/arrayJsonEditorProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(ArrayJsonEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
