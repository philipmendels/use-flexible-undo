### Memoization - Example

In this example the **handlers** object is memoized before passing it to **useUndoableEffects**, so that the **undoables** (the undoable functions returned by the hook) are not recreated on every render. In the actions panel 👉 (or the browser console) the message 'UNDOABLES CHANGED' should only be logged when opening this example, and not when interacting with it.
