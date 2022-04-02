/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async () => {
  return { hello: "world" };
});

// Auth

Route.group(() => {
  Route.post("/register", "AuthController.register").as("registerUser");
  Route.post("/otp-confirmation", "AuthController.otp_verification").as(
    "otpVerification"
  );
  Route.post("/login", "AuthController.login").as("user.login");
}).prefix("/api/v1");

// Venue

Route.group(() => {
  Route.resource("venues", "VenuesController").apiOnly();
})
  .prefix("/api/v1")
  .middleware(["auth", "verify", "owner"]);

// Field
Route.group(() => {
  Route.resource("venues.fields", "FieldsController").apiOnly();
})
  .prefix("/api/v1")
  .middleware(["auth", "verify", "owner"]);

// Booking
Route.group(() => {
  Route.post("/venues/:id/bookings", "Booki");
});
