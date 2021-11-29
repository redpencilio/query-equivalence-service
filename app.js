import { app, query, errorHandler } from "mu";
import hash from "object-hash";

app.get("/", function (req, res) {
  res.json("Hello from query-equivalence-service");
});

app.get("/equivalent", async function (req, res, next) {
  const validQuery = req.query.validQuery;
  if (validQuery === undefined) {
    const err = new Error("Required query param 'validQuery' missing");
    err.status = 400;
    next(err);
    return;
  }
  const otherQuery = req.query.otherQuery;
  if (otherQuery === undefined) {
    const err = new Error("Required query param 'otherQuery' missing");
    err.status = 400;
    next(err);
    return;
  }

  let validResponse;
  let otherResponse;
  try {
    [validResponse, otherResponse] = await Promise.all([
      query(validQuery),
      query(otherQuery),
    ]);
  } catch (err) {
    next(err);
    return;
  }

  let equivalent = queriesAreEqual(validResponse.results, otherResponse.results);

  return res.status(200).json({
    data: {
      id: "1",
      type: "equivalenceResults",
      attributes: {
        equivalent: equivalent,
      }
    },
  });
});

let queriesAreEqual = (validResults, otherResults) => {
  if (validResults.bindings.length !== otherResults.bindings.length) {
    return false;
  }

  let validResultsArray = validResults.bindings.map((result) =>
    hashQueryResult(result)
  );
  for (let result of otherResults.bindings) {
    let index = validResultsArray.indexOf(hashQueryResult(result));
    if (index > -1) {
      // If matched, remove from validResults array so in case a row is repeated
      // in otherResults but not in validResults, we correctly mark it as unequal
      validResultsArray.splice(index, 1);
    } else {
      return false;
    }
  }
  return true;
};

let hashQueryResult = (result) => {
  /*
    Shape of result item:
    {
      ?x1: {
        type: 'uri',
        value: 'http://some-uri.com/example#Item',
      },
      ?x2: {
        type: 'literal',
        value: 'val'
      }
    }
    Because we want to treat queries with different variableNames but same results as equal,
    we ignore the variableName when calculating the hash, so we use Object.values().
  */
  return hash(Object.values(result));
};

app.use(errorHandler);
