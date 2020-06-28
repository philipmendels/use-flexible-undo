### makeHandler & combineHandlers - Example

This example is equivalent to the previous example, except that we do not write the handlers from scratch. Here we use the utility **makeHandler** to convert "setCount" to handlers for adding and subtracting. We use these handlers as the do/redo and undo handlers for the "add" function, and we re-use them inversely as the undo and do/redo handlers for the "subtract" function. Additionally we use **combineHandlers** to pair up the handlers into undoable handler objects, instead of writing these out in full.
