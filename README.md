# useFlexibleUndo ⎌

**useFlexibleUndo** is a [custom React hook](https://reactjs.org/docs/hooks-custom.html) that that keeps a **history of undoable actions** - as opposed to a history of snapshots of (a slice of) state. **How you manage your state is up to you** and independent of the undo mechanism.

See the StoryBook for a wide range of interactive examples with documentation and code.

## motivation

I have used [Redux-Undo](https://github.com/omnidan/redux-undo) to add undo functionality to some projects in which I used [Redux](https://redux.js.org/) for state management. It works great. I did however feel the urge to explore If I could make a more flexible alternative that I could easily use in more lightweight projects (without global state and with less indirection) - including prototypes. Additionally I am interested in learning (ongoing process) about the differences (pros and cons) of having an action history vs a history of state snapshots, and their relation to some more nerdy 🤓 topics such a nonlinear undo and infinite undo.

## warning

This library cannot be used to undo 'real-life' events such as:

- breaking up with your girl/boyfriend.
- launching a nuclear missile
- missing an open chance in the football WC final against Spain

## makeUndoable

**makeUndoable** takes an object with an action type and undo/redo handlers. The undo and redo handlers take the payload (here named "amount") as single argument and use it to update the state. Here we make a single undoable function "add". Each time we call "add" the redo handler will be called once immediately, and an action with type "add" and a simple delta value of type number as payload will be stored in the history, so we can undo/redo later.

```typescript
const add = makeUndoable<number>({
  type: 'add',
  redo: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});
```

<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/use-flexible-undo.png" width="500"/>

## storing the previous state

<img src="https://github.com/philipmendels/use-flexible-undo/raw/master/assets/use-flexible-undo-2.png" width="792"/>
