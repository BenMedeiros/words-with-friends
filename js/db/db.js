'use strict';

export default {
  get
}

// get id from Dynamo table items
async function get(id) {
  try {
    const response = await fetch(
      "https://lfiwccnp51.execute-api.us-west-2.amazonaws.com/default/lamda_test_template_restful?"
      + new URLSearchParams({TableName: 'items', Item: id})
    );

    const result = await response.json();
    console.log("Success:", result);
    return result.body.Item;
  } catch (e) {
    console.error(e);
  }
}

async function postItems(id, items) {
  try {
    const response = await fetch(
      // "https://lfiwccnp51.execute-api.us-west-2.amazonaws.com/default/lamda_test_template_restful?"
      // + new URLSearchParams({TableName: 'items'}), {

      "https://lfiwccnp51.execute-api.us-west-2.amazonaws.com/default/lamda_test_template_restful", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "TableName": "items",
            "Item": {
              "id": 'receipt-scanner.' + id,
              "items": items
            }
          }
        )
      }
    );

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
