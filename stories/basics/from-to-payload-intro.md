### From-To state as payload - Example

In this example we have one undoable function "updateCount" that takes a payload with the current "from" state and the new "to" state. We then use "updateCount" to create functions for the more specialized operations add, subtract, multiply and divide which are all called with fixed payloads (2, 1, PI and PI).
