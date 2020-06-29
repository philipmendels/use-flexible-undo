### makeUndoableFTHandler & wrapFTHandler - Example

This example is equivalent to the previous example, except that we we use the utility **makeUndoableFTHandler** to convert "setCount" to the do/redo and undo handlers for "updateCount". We then use **wrapFTHandler** to convert "updateCount" to the more specialized functions add, subtract, multiply and divide.
