### makeFTHandler & invertFTHandler - Example

In this example we do not create a single handlers object in which the do/redo and undo handlers are joined per action type. Instead we pass the do/redo handler for "updateCount" and the undo handler for "updateCount" separately to **useUndoableEffects**. We create the do/redo handler using the util **makeFTHandler** and we convert it to the undo handler using the util **invertFTHandler**.
