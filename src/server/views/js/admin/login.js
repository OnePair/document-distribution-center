$(document).ready(() => {
  $("#login-button").click(login);
});

function login() {
  return new Promise(async (onSuccess) => {
    try {
      let authRequest = await getAuthRequest();
      let authResponse = await signAuthRequest(authRequest);

      // Send the authentication response
      submitAuthResponse(authResponse["authResponse"]);


      onSuccess();
    } catch (err) {
      console.log("error:", err);
      alert("Login failed!");
    }
  });
}

function getAuthRequest() {
  return new Promise((onSuccess) => {
    let id = $("#authid-input").val();

    $.ajax({
      url: "/admin/authRequest",
      type: "POST",
      data: JSON.stringify({
        id: id
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data, status) => {
        onSuccess(data);
      }
    });
  });
}

function signAuthRequest(authRequest) {
  return new Promise(async (onSuccess, onError) => {
    try {
      let authResponse = await authID.signAuthRequest(authRequest);

      onSuccess(authResponse);
    } catch (err) {
      onError(err);
    }
  });
}


function submitAuthResponse(authResponse) {
  $("#auth-response-input").val(authResponse);
  $("#login-form").submit();
}
