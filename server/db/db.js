'use strict';

export default {
  get,
  post
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

async function post(id, payload) {
  try {
    const response = await fetch(
      "https://lfiwccnp51.execute-api.us-west-2.amazonaws.com/default/lamda_test_template_restful", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "TableName": "items",
            "Item": {
              "id": 'words-with-friends.'+id,
              "items": payload
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
