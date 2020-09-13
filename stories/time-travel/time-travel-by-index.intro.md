### Time travel by index - Example

In this example you can see how you can create a basic undo history UI for time traveling. Here we reverse the stack of actions from the current branch of the **history** state in order to see the most recent action on top. We map over it and for each action return a basic description of the type and payload. When the user clicks such a description the **timeTravel** function is called with the index of the corrsponding action. We need to calculate the correct index because we map over the _reversed_ stack.
