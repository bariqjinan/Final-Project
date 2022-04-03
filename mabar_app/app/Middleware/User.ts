import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class User {
  public async handle(
    { response, auth }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const role = auth.user?.role;

    if (role == "user") {
      await next();
    } else {
      return response.unauthorized({
        message: "only user who can access this",
      });
    }
  }
}
