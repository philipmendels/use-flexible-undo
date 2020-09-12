### Restoring state from history - Example

In this example we load the history state from localStorage after the first render of the component. Then we make a backup of the current action index of the history state and change the original index to zero. Then we restore the modified history state using **setHistory** and restore the application state by **timeTravel**ling to the backed up index. Also we save the history state to localStorage on every state change.

Make some changes and refresh the page (or switch back and forth between examples) to see that both the application state and history state persist, even though we only save the history state.
