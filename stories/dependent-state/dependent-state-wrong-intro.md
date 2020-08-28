### Don't do this - Example

This example is broken on purpose to illustrate that you should not directly refer to state dependencies from within your do/redo & undo handlers. The problem is that if the handlers are called multiple times within a single React update, then they will not use the updated state but the stale version of it. You will _not_ run into this issue when rapidly clicking undo/redo because each click triggers a separate update. You however _do_ run into trouble when using time-travel. To see the problem:

- Click "add" one or more times.
- Change the amount.
- Again click "add" one or more times.
- Time-travel to the bottom of the stack (the action list) and back to the top one or more times to see the "count" state getting 'out-of-sync'.
