### Intro Example

The React hook **useFlexibleUndo** keeps track of undoable actions, as opposed to snapshots of state. How you manage your application state is up to you and independent of the undo history state that is managed by the hook internally.

In this example there is a basic "count" state and two undoable functions "add" and "subtract" which are called with fixed payloads (2 and 1). The undo and redo buttons are disabled based on the **canUndo** and **canRedo** booleans returned by the hook.

See the readme 👉 of each example for code samples and more info, and see the other examples 👈 for different ways of making undoable functions and managing state.
