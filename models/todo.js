import mongoose from "mongoose";
import toAdjacencyList from "../util/toAdjacencyList.js";
import { creatreArrayOfEmptyArrays } from "../util/toAdjacencyList.js";
import BFS from "../util/bfs.js";

const { Schema } = mongoose;

const todoSchema = Schema();
todoSchema.add({
  description: String,
  done: {
    type: Boolean,
    default: false,
  },
  isRoot: {
    type: Boolean,
    default: false,
  },
  subTodos: [{ type: Schema.Types.ObjectId, ref: "todos" }],
});

todoSchema.statics.saveTodo = async function (todos, callback) {
  const { bfsTraversal } = BFS(todos, "subTodos");
  const {
    numberToNode,
    nodeToNumber,
    inVertices,
    outVertices,
  } = toAdjacencyList(todos, "subTodos");
  const savedChildrenObjIds = creatreArrayOfEmptyArrays(bfsTraversal.length);
  const reverseBfs = bfsTraversal.slice().reverse();
  let lastSave;
  for (const todo of reverseBfs) {
    const nodeNum = nodeToNumber.get(todo);
    const toSave = {
      description: todo.description,
      done: todo.done,
      isRoot: todo.isRoot,
      subTodos: savedChildrenObjIds[nodeNum],
    };
    lastSave = await new this(toSave).save();
    const { _id } = lastSave;
    for (const perent of inVertices[nodeNum]) {
      savedChildrenObjIds[perent].push(_id);
    }
  }

  if (callback instanceof Function) {
    return callback(lastSave);
  } else {
    return lastSave;
  }
};

todoSchema.statics.populateAll = async function (root, limit) {
  const maxDepth = limit ?? Infinity;
  const queue = [];
  queue.push({ item: root, depth: 0 });
  while (queue.length > 0) {
    const { item, depth } = queue.shift();
    if (depth < maxDepth) {
      await this.populate(item, {
        path: "subTodos",
        model: this,
      });
    }
    if (item?.subTodos?.length > 0 && depth < maxDepth)
      item.subTodos.forEach((subTodo) =>
        queue.push({ item: subTodo, depth: depth + 1 })
      );
  }
};

todoSchema.statics.updateTodo = async function (todo) {
};

todoSchema.statics.deleteTodo = async function (todo) {
};

const todoModel = mongoose.model("todos", todoSchema, "todos");
export default todoModel;
