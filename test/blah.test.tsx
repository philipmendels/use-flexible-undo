import { History, HistoryItemUnion } from '../src';
import { getPathFromCommonAncestor, updatePath } from '../src/helpers';

interface PBT {
  act: string;
}
const createStack = (id: string): HistoryItemUnion<PBT>[] =>
  new Array(4).fill(0).map((_, idx) => ({
    created: new Date(),
    id: id + idx,
    type: 'act',
    payload: id,
  }));

const history: History<PBT> = {
  branches: {
    a: {
      created: new Date(),
      id: 'a',
      stack: createStack('a'),
    },
    b: {
      created: new Date(),
      id: 'b',
      stack: createStack('b'),
      parent: {
        branchId: 'a',
        position: {
          actionId: 'a2',
          globalIndex: 2,
        },
      },
    },
    c: {
      created: new Date(),
      id: 'c',
      stack: createStack('c'),
      parent: {
        branchId: 'b',
        position: {
          actionId: 'b0',
          globalIndex: 3,
        },
      },
    },
    d: {
      created: new Date(),
      id: 'd',
      stack: createStack('d'),
      parent: {
        branchId: 'c',
        position: {
          actionId: 'c1',
          globalIndex: 5,
        },
      },
    },
  },
  currentBranchId: 'a',
  currentPosition: {
    actionId: 'a0',
    globalIndex: 0,
  },
};

// const path = getPathFromCommonAncestor(history, 'd');
// console.log('path', path);
// console.log(updatePath(path.map(b => b.id))(history));

const history2: History<PBT> = {
  branches: {
    a: {
      created: new Date(),
      id: 'a',
      stack: createStack('a'),
    },
    b: {
      created: new Date(),
      id: 'b',
      stack: createStack('b'),
      parent: {
        branchId: 'a',
        position: {
          actionId: 'a2',
          globalIndex: 2,
        },
      },
    },
    c: {
      created: new Date(),
      id: 'b',
      stack: createStack('b'),
      parent: {
        branchId: 'a',
        position: {
          actionId: 'a2',
          globalIndex: 2,
        },
      },
    },
  },
  currentBranchId: 'a',
  currentPosition: {
    actionId: 'a0',
    globalIndex: 0,
  },
};

const path = getPathFromCommonAncestor(history2, 'b');
console.log('path', path);
console.log(updatePath(path.map(b => b.id))(history2));

// describe('it', () => {
//   it('does it', () => {
//     // const div = document.createElement('div');
//     // ReactDOM.render(<Thing />, div);
//     // ReactDOM.unmountComponentAtNode(div);
//   });
// });
