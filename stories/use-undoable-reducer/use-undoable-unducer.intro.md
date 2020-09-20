### makeUndoableReducer with an unducer - Example

In this example we create a special reducer and an object with combined do/redo & undo action creators using the utility **makeUnducer**. We then pass this "unducer" to **makeUndoableReducer**. The returned undoable reducer is passed together with the combined action creators and the initial state to **useUndoableReducer**.
