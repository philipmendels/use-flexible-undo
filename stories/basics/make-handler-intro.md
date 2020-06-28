### makeHandler & combineHandlers - Example

This example is equivalent to the previous example, except that we do not manually contruct the handlers. Here we use the utility **makeHandler** to convert "setCount" to the do/redo and undo handlers for "add" and "subtract". Additionally, we use **combineHandlers** to combine the handlers, instead of pairing them in objects manually.
