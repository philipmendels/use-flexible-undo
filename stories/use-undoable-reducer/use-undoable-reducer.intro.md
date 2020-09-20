### makeUndoableReducer & useUndoableReducer - Example

In this example we create a reducer and do/redo action creators using the utility **makeReducer**. We then pass this reducer together with undo action creators to **makeUndoableReducer**. The returned undoable reducer is passed together with the do/redo action creators and the initial state to **useUndoableReducer**.
