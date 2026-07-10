/* ==========================================================
   SUCCESS RESPONSE
   Supports BOTH:
   successResponse(res, "Message", data)
   successResponse(res, 201, "Message", data)
========================================================== */

export const successResponse = (
  res,
  statusOrMessage = 200,
  messageOrData = null,
  data = null
) => {
  let statusCode = 200;
  let message = "Success";
  let responseData = null;

  if (typeof statusOrMessage === "number") {
    statusCode = statusOrMessage;
    message = messageOrData || "Success";
    responseData = data;
  } else {
    message = statusOrMessage || "Success";
    responseData = messageOrData;
  }

  const response = {
    success: true,
    message,
  };

  if (responseData !== null && responseData !== undefined) {
    response.data = responseData;
  }

  return res.status(statusCode).json(response);
};

/* ==========================================================
   ERROR RESPONSE
   Supports BOTH:
   errorResponse(res, "Message")
   errorResponse(res, "Message", 404)
   errorResponse(res, 404, "Message")
   errorResponse(res, 404, "Message", error)
========================================================== */

export const errorResponse = (
  res,
  statusOrMessage = 500,
  messageOrStatus = "Something went wrong",
  error = null
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  if (typeof statusOrMessage === "number") {
    statusCode = statusOrMessage;
    message = messageOrStatus || "Something went wrong";
  } else {
    message = statusOrMessage || "Something went wrong";

    if (typeof messageOrStatus === "number") {
      statusCode = messageOrStatus;
    } else if (messageOrStatus instanceof Error) {
      error = messageOrStatus;
    }
  }

  const response = {
    success: false,
    message,
  };

  if (
    process.env.NODE_ENV === "development" &&
    error
  ) {
    response.error =
      typeof error === "string"
        ? error
        : error.message;
  }

  return res.status(statusCode).json(response);
};