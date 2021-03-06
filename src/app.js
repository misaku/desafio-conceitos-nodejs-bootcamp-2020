const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// FUNÇÃO PARA CRIAR OBJETO NA ESTRUTURA CERTA
const makeObject = ({ url, title, techs }) => {
  const id = uuid();
  const likes = 0;
  return { id, title, url, techs, likes };
};

// MIDLEWARE DE VALIDAÇÃO SE O ID É UM UUID E SE EXISTE ELEMENTO NO ARRAY
const checkValidId = (request, response, next) => {
  const { id: idRepo } = request.params;
  if (isUuid(idRepo)) {
    const repository = repositories.find(({ id }) => id === idRepo);
    if (repository) {
      return next();
    }
  }
  return response.status(400).json("Invalid project id");
};

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const newRepo = makeObject(request.body);
  repositories.push(newRepo);
  return response.json(newRepo);
});

// APLICANDO VALIDAÇÃO
app.use("/repositories/:id", checkValidId);

app.put("/repositories/:id", (request, response) => {
  const { id: idRepo } = request.params;
  const repository = repositories.find(({ id }) => id === idRepo);

  /**
   * EU PODERIA TER DESISTRUTURADO EM CIMA O TITLE, O URL E O TECHS, MAS
   * COMO QUERIA ALTERAR SOMENTE OS INTENS PASSADOS E QUE ESTIVESSE COM
   * AUTORIZAÇÃO PARA ATUALIZAR, PREFERI FAZER UM POUCO DINAMICO
   */
  const validCols = ["title", "url", "techs"];
  Object.keys(request.body).forEach((element) => {
    if (validCols.includes(element))
      repository[element] = request.body[element];
  });
  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id: idRepo } = request.params;
  const repository = repositories.find(({ id }) => id === idRepo);
  const index = repositories.indexOf(repository);
  if (index >= 0) repositories.splice(index, 1);
  return response.status(204).json({});
});

app.post("/repositories/:id/like", (request, response) => {
  const { id: idRepo } = request.params;
  const repository = repositories.find(({ id }) => id === idRepo);
  repository.likes++;
  return response.json(repository);
});

module.exports = app;
