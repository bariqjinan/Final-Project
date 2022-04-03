import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";

export default class Verify {
  public async handle(
    { response, request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let email = request.input("email");
    let user = await User.findByOrFail("email", email);
    let isVerified = user.isVerified;
    if (isVerified) {
      await next();
    } else {
      return response.unauthorized({ message: "verify your otp first!!" });
    }
  }
}
