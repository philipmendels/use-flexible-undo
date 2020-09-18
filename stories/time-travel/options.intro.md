### Option to clear the future - Example

In this example you can change the option **clearFutureOnDo** at runtime. To see the effect of this option:

- add some actions to branch 1, undo, and add another action to create branch 2
- switch back to the head of branch 1
- again add some actions to branch 1, undo, and add another action to create branch 3
- switch back to branch 1 and time travel somewhere in between the start of branch 2 and branch 3
- set clearFutureOnDo to true
- add an action to branch 1 and see the future along with branch 3 being cleared. Branch 2 should still exist because it starts in the past.
