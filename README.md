
# document-distribution-center

> A server that distributes AuthID signed documents which can then be independently verified.

The goal of the this project was to create a key/document distribution center while limiting its ability to falsify the documents that it distributes. This is done by making the verification of the documents independent of the server by leveraging the [AuthID](https://github.com/OnePair/authid-core-ts) protocol.

## Install

```npm install .```

## Build
```npm run build```

## Start

```document-distribution-center start```

##  Set the admin

* Add an id to the `root_admin` field in ~/.document-distribution-center/config.json`.
*  The admin application will be at `http://localhost:8888/admin`. Login with your AuthID wallet.


## TODO: API functions
