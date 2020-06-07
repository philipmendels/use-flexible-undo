This example is broken on purpose to illustrate that you should not make your redo/undo handlers depend on external state. The problem is that the handlers may run before the external state is updated if you click undo or redo in fast succession or if you use time travel. To see the problem:

- Click 'add' one ore more times
- Change the amount
- Again click 'add' one ore more times
- Time-travel to the bottom of the stack and back to the top one or more times to see the 'count' state getting out-of-sync
