# query-equivalence-service

Microservice that checks if two SPARQL queries are equivalent.

## Info

This microservice takes in two queries and checks that they are equivalent by executing them in parallel and checking that the output of both match.

This microservice depends on [object-hash](https://github.com/puleos/object-hash) to hash and compare the results of the query.

##  How-to guide

### Docker Compose

To add this serice to your semantic.works stack, add the following snippet to your `docker-compose.yml` file

```yml
services:
  query-equivalence:
    image: sergiofenoll/query-equivalence:1.0.0
    links:
      - database:database
```

### Configuration

This microservice supports the same environment variables supported by the `mu-javascript-template` image, of note being 

`MU_SPARQL_ENDPOINT`: The endpoint the queries should be sent to

## Known limitations

As is, the microservice checks equality based on query output as opposed to "do these two queries ask for the same things?".
Although checking that queries are semantically equivalent (without having to execute them) would be a lot better,
it sounds like a pretty hard problem to solve, so at least for now it's out of scope of this microservice. Basing this on output isn't foolproof either,
because depending on the shape of the dataset, two entirely different queries could produce the same output, but this problem
is ignored for the purposes of this microservice.

Currently, column ordering isn't ignored. As an example, `SELECT ?s ?t WHERE { ?s a ?t . }` and `SELECT ?t ?s WHERE { ?s a ?t . }` don't match, even though they contain the same data.
