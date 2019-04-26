
# document-distribution-center

> A server that distributes AuthID signed documents which can then be independently verified by clients.

The goal of the this project was to create a key/document distribution center while limiting its ability to falsify the documents that it distributes. This is done by making the verification of the documents independent of the server by leveraging the [AuthID](https://github.com/OnePair/authid-core-ts) protocol.

## Install

```npm install .```

## Build
```npm run build```

## Start

```document-distribution-center start```

##  Add an admin user

* Add an id to the `root_admin` field in ~/.document-distribution-center/config.json`.
*  The admin application will be at `http://localhost:8888/admin`. Login with your AuthID wallet.


## API Functions

### Get the supported document stores
Gets a name to schema map of the supported document stores.

* **URL**
`/v0.0.1/ddc/api/documentStores`

* **Method**
`GET`

* **Success Response**
code: `200`
 content: `{<store_name>: <schema_address>}`

### Set document

Set a document on the instance. The document will be binded to the id it was created with.

* **Create Document**
1.  Document format
```json
{
document: <document>
}
```
2. Create jwt
```js
var doc = authID.createJwt(document);
```

* **URL**
`/v0.0.1/ddc/api/setDocument`

* **Method**
`POST`

* **Data Params (JSON)**
`document=[string]`
`schemaAddress=[string]`

* **Success Response**
code: `200`

* **Error Response**
code: `500`
content: `{error: <error message>}`

### Get Document
Get the document created by the provided id.

* **URL**
`/v0.0.1/ddc/api/documentStores/<schemaAddress>/<id>`

* **Method**
`GET`

* **Success Response**
code: `200`
content: `{document: [string]}`

* **Error Response**
code: `404`
content: `{error: <error message>}`