### unducer & makeUndoableUpdater - Example

In this example we manually create a reducer that handles the "undo" cases internally. Instead of inverting the do/redo handlers or the do/redo action creators like we did in the previous examples, we here dispatch actions with a `{ meta: { isUndo: boolean }}` part so that we can differentiate between do/redo and undo in the reducer.
