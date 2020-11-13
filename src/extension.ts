"use strict";
import * as vscode from "vscode";

enum ShowType {
	SHOW_START_END,
	SHOW_ANCHOR_ACTIVE,
}

enum ELastIndex {
	LAST_ELEMENT,
	ONE_AFTER_THE_LAST_ELEMENT,
}

interface ISelectionConfig {
	lastIndex: ELastIndex;
	showType: ShowType;
}

const selectionConfig: ISelectionConfig = {
	lastIndex: ELastIndex.LAST_ELEMENT,
	showType: ShowType.SHOW_START_END,
};

export function activate(context: vscode.ExtensionContext): void {
	let offsetType = "character";
	const statusBarEntry: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarEntry.tooltip = "Go to offset";
	statusBarEntry.command = "showoffset.goToOffset";

	const updateOffsetType = () => {
		const updatedConfig = vscode.workspace.getConfiguration("showoffset");
		if (offsetType !== updatedConfig["offsetType"] && (updatedConfig["offsetType"] === "character" || updatedConfig["offsetType"] === "byte")) {
			offsetType = updatedConfig["offsetType"];
			updateOffset();
		}
	};

	const updateOffset = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			statusBarEntry.text = "";
			statusBarEntry.hide();
			return;
		}
		if (!statusBarEntry.text) {
			statusBarEntry.show();
		}

		let offsetStart: number;
		let offsetEnd: number;
		let msgStart: string;
		let msgEnd: string;
		if (selectionConfig.showType === ShowType.SHOW_ANCHOR_ACTIVE) {
			offsetStart = editor.document.offsetAt(editor.selection.active);
			offsetEnd = editor.document.offsetAt(editor.selection.anchor);
			msgStart = "С";
			msgEnd = "К";
		} else if (selectionConfig.showType === ShowType.SHOW_START_END) {
			offsetStart = editor.document.offsetAt(editor.selection.start);
			offsetEnd = editor.document.offsetAt(editor.selection.end);
			msgStart = "П";
			msgEnd = "К";
		}

		if (offsetType === "byte") {
			offsetStart = Buffer.byteLength(editor.document.getText().substr(0, offsetStart));
		}
		if (selectionConfig.lastIndex == ELastIndex.LAST_ELEMENT) {
			offsetEnd--;
		}
		if (offsetType === "byte") {
			offsetEnd = Buffer.byteLength(editor.document.getText().substr(0, offsetEnd));
		}
		statusBarEntry.text = `${msgStart}:${offsetStart},${msgEnd}:${offsetEnd}`;
	};

	const goToOffset = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const maxOffset = offsetType === "byte" ? Buffer.byteLength(editor.document.getText()) : editor.document.getText().length;
		vscode.window.showInputBox({ prompt: `Type offset between 0 and ${maxOffset} to navigate to` }).then((offset) => {
			const offsetNumber = /^[\d]+$/.test(offset) ? Number(offset) : -1;
			if (offsetNumber < 0 || offsetNumber > maxOffset) {
				return;
			}
			const newPosition = editor.document.positionAt(offsetNumber);
			editor.selection = new vscode.Selection(newPosition, newPosition);
			editor.revealRange(editor.selection);
		});
	};

	updateOffset();
	updateOffsetType();
	statusBarEntry.show();

	vscode.window.onDidChangeTextEditorSelection(updateOffset, null, context.subscriptions);
	context.subscriptions.push(vscode.commands.registerCommand("showoffset.goToOffset", goToOffset));

	vscode.workspace.onDidChangeConfiguration(() => {
		updateOffsetType();
	});
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
