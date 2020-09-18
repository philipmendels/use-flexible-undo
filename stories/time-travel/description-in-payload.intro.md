### Describe actions: details in payload - Intro

In this example the operations "add", "subtract", "multiply" and "divide" are modelled as a single action "updateCount" with from- and to-state as payload. In order to describe the exact user actions in the undo history UI, the payload is extended with the name of the operation and the amount (delta) by which "count" is changed.
