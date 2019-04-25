const DOC_STORE_LIST = "#doc-stores-list";

$(document).ready(() => {
  $("#create-store-button").click(() => {
    createDocStore();
  });
});

var docStores;

async function loadDocStoresDiv() {
  loadDocStoreList();
}

function clearDocList() {
  $("#doc-stores-list").html("");
}

async function loadDocStoreList() {
  docStores = await getDocStores();

  for (var storeName in docStores) {
    let schemaAddress = docStores[storeName];

    createListItem(DOC_STORE_LIST, storeName, "Schema", schemaAddress);
  }

  setupPanelList();
}

async function refreshDocStoreList() {
  clearDocList();
  loadDocStoreList();
}

function getDocStores() {
  return new Promise((onSuccess) => {
    $.ajax({
      url: "/v0.0.1/ddc/api/documentStores",
      type: "GET",
      contentType: "application/json; charset=utf-8",
      success: (data, status) => {
        onSuccess(data);
      }
    });
  });
}

/*
 * Create a new document store
 */
async function createDocStore() {
  var name = $("#create-store-name-input").val();
  var schemaString = $("#create-store-schema-input").val();

  if (name.length == 0) {
    alert("Name input empty!");
    return;
  }

  if (schemaString.length == 0) {
    alert("Schema input is empty!");
    return;
  }

  if (name in docStores) {
    alert("The schema name is already taken!");
    return;
  }

  try {
    var schema = JSON.parse(schemaString);
    // Send the HTTP request
    $.ajax({
      url: "/admin/createDocumentStore",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        name: name,
        schema: schema
      }),
      success: (data, status) => {
        refreshDocStoreList();
      }
    });
  } catch (err) {
    alert("Could not create document store!");
  }
}
