### State delta as payload - Example

Just as in the previous example, we here manually create the do/redo and undo handlers for the undoable "add" and "subtract" functions. Each handler takes a payload ("amount") of type number that represents the change for the "count" state. Each time we call an undoable function ("add" or "subtract") the do/redo handler will be called once immediately, and an action with the corresponding type ("add" or "subtract") and payload will be added to the history as you can see below. Note that the action types are equal to the function names.
