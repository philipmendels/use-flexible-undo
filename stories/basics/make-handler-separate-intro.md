### Separate drdoHandlers and undoHandlers - Example

In this example we do not create a single handlers object in which the do/redo and undo handlers are joined per action type. Instead we pass the do/redo handlers for "add" and "subtract" and the undo handlers for "add" and "subtract" as separate objects to **useUndoableEffects**.
