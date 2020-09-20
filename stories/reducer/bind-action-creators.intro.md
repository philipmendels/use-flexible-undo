### makeReducer & bindActionCreators - Example

This example is the same as the previous example, except that we use the utility **makeReducer** to construct the reducer, and the utility **bindActionCreators** to construct the do/redo handlers. The undo handlers are created by inverting the do/redo handlers. The do/redo handlers and undo handlers are passed as separate props to **useUndoableEffects**.
