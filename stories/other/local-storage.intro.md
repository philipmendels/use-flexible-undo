### setHistory from localStorage - Example

In this example we load the application state and the history state from localStorage after the first render of the component. Then we restore the application state using setCount and setAmount, and the history state using **setHistory** which is returned by the hook. Also we save all state to localStorage on every state change.

Make some changes and refresh the page (or switch back and forth between examples) to see that the state persists.
