import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import UserValidator from "App/Validators/UserValidator";
import Database from "@ioc:Adonis/Lucid/Database";
import Mail from "@ioc:Adonis/Addons/Mail";
import { schema } from "@ioc:Adonis/Core/Validator";

export default class AuthController {
  /**
   *
   * @swagger
   * /api/v1/register:
   *    post:
   *      tags:
   *        - Authentication
   *      summary: Register account
   *      description: Enpoint for register new account
   *      requestBody:
   *        required: true
   *        content:
   *          application/x-www-form-urlencoded:
   *            schema:
   *              $ref: '#definitions/User'
   *          application/json:
   *            schema:
   *              $ref: '#definitions/User'
   *      responses:
   *        201:
   *          description: success register, please verify your otp first
   *        422:
   *          description: invalid request
   *
   *
   */

  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(UserValidator);
    const newUser = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });

    const otp_code: number = Math.floor(100000 + Math.random() * 900000);

    await Database.table("otp_codes").insert({
      otp_code: otp_code,
      user_id: newUser.id,
    });

    await Mail.send((message) => {
      message
        .from("admin@sanberdev.com")
        .to(payload.email)
        .subject("Welcome Onboard!")
        .htmlView("mail/otp_verification", {
          name: payload.name,
          otp_code: otp_code,
        });
    });

    return response.created({
      newUserId: newUser.id,
      message: "success register, please verify your otp first",
    });
  }

  /**
   *
   * @swagger
   * /api/v1/otp-confirmation:
   *  post:
   *    tags:
   *      - Authentication
   *    summary: OTP Verify
   *    decription: Endpoint for verify OTP code
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type : string
   *                format: email
   *                example: bariq@gmail.com
   *              otp_code:
   *                type: string
   *                minLength: 6
   *                example: 123456
   *            required:
   *              - email
   *              - otp_code
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type : string
   *                format: email
   *                example: bariq@gmail.com
   *              otp_code:
   *                type: string
   *                minLength: 6
   *                example: 123456
   *            required:
   *              - email
   *              - otp_code
   *    responses:
   *      200:
   *        description: OTP verify success
   *      400:
   *        description: OTP verify failed
   *
   */

  public async otp_verification({ request, response }: HttpContextContract) {
    let email = request.input("email");
    let otp_code = request.input("otp_code");

    const user = await User.findByOrFail("email", email);
    const dataOtp = await Database.from("otp_codes")
      .where("otp_code", otp_code)
      .firstOrFail();

    if (user.id == dataOtp.user_id) {
      user.isVerified = true;
      await user.save();

      return response.ok({ message: "otp verify success" });
    } else {
      return response.badRequest({ message: "otp verify failed" });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/login:
   *  post:
   *    tags:
   *      - Authentication
   *    summary: Login
   *    decription: Endpoint for login
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type : string
   *                format: email
   *                example: bariq@gmail.com
   *              password:
   *                type: string
   *                minLength: 5
   *
   *            required:
   *              - email
   *              - password
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type : string
   *                format: email
   *                example: bariq@gmail.com
   *              password:
   *                type: string
   *                minLength: 5
   *
   *            required:
   *              - email
   *              - password
   *    responses:
   *      200:
   *        description: Success login
   *      400:
   *        description: Bad request
   *      422:
   *        description: You have not verified
   *
   */

  public async login({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string(),
      password: schema.string(),
    });

    try {
      const payload = await request.validate({ schema: userSchema });

      const token = await auth
        .use("api")
        .attempt(payload.email, payload.password);

      return response.ok({ message: "login success", token });
    } catch (error) {
      if (error.guard) {
        return response.badRequest({
          messages: "login error",
          error: error.message,
        });
      } else {
        return response.badRequest({
          message: "login error",
          error: error.messages,
        });
      }
    }
  }
}
