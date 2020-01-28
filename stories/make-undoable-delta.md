Make an undoable action with a delta ('amount') as payload:

```typescript
const add = makeUndoable<number>({
  type: 'add',
  do: amount => setCount(prev => prev + amount),
  undo: amount => setCount(prev => prev - amount),
});
```
