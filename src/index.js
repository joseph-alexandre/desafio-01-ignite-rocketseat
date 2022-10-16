const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;

  const user = users.find(item => item.username === username);

  if(user === undefined) {
    return response.status(404).send({ error: 'Usuário não encontrado.' })
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next){
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(item => item.id === id);
  
  if(todo === undefined) {
    return response.status(404).send({ error: `TODO não encontrado para o usuário ${user.name}.`})
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if(users.some(item => item.username === username)){
    return response.status(400).send({ error: `O usuário ${username} já existe.`});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline : new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;
  
  todo.done = true;

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo, user } = request;
  
  user.todos = user.todos.filter(item => item.id !== todo.id);

  return response.status(204).send();
});

module.exports = app;