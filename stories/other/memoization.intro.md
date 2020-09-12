### Memoization - Example

In this example the **handlers** object is memoized before passing it to **useUndoableEffects**, so that the **undoables** (the undoable functions returned by the hook) are not recreated on every render. In the actions panel 👉 (and the browser console) the message "undoables changed" should only be logged when opening this example, and not during subsequent updates.
