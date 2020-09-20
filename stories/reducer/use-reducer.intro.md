### reducer & makeUpdater - Example

In this example "count" and "amount" are combined in a single state object. We manually create a reducer, in which "amount" is updated, and retrieved from the previous state in order to update "count". The dispatch function which is returned from useReducer is called from the do/redo & undo handlers for "add", "subtract" and "updateAmount".
