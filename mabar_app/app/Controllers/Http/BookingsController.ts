import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Booking from "App/Models/Booking";
import Field from "App/Models/Field";
import User from "App/Models/User";
import Venue from "App/Models/Venue";
import BookingValidator from "App/Validators/BookingValidator";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class BookingsController {
  /**
   *
   * @swagger
   * /api/v1/bookings:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for get all bookings
   *    responses:
   *      200:
   *        description: success get all data bookings
   *      401:
   *        description: You dont have permission to access this
   *
   */
  public async index({ response }: HttpContextContract) {
    const booking = await Booking.query()
      .preload("field", (query) => {
        query.preload("venue");
      })
      .withCount("players");

    return response.ok({ message: "success get data booking", data: booking });
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{id}/bookings:
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Venue
   *    description: Endpoint for booking field
   *    parameters:
   *      -
   *       in: 'path'
   *       name: 'id'
   *       required: true
   *       schema :
   *        type: integer
   *        minimum: 1
   *        example: 1
   *       description: The Venue ID
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Booking'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Booking'
   *    responses:
   *      201:
   *        description: success booking
   *      401:
   *        description: you dont have permission to access this
   *      400:
   *        description: you cant book this field
   *
   */

  public async store({ request, response, params, auth }: HttpContextContract) {
    let payload = await request.validate(BookingValidator);
    let authUser = auth.user!;

    let field = await Field.findByOrFail("id", payload.field_id);
    let venue = await Venue.findByOrFail("id", params.id);

    if (field.venueId == venue.id) {
      const booking = new Booking();
      booking.playDateStart = request.input("play_date_start");
      booking.playDateEnd = request.input("play_date_end");
      booking.totalPlayers = request.input("total_players");
      booking.userId = authUser.id;

      booking.related("field").associate(field);
      return response.created({ message: "success booking" });
    } else {
      return response.badRequest({ message: "you cant book this field" });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for get detail booking
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Booking ID
   *    responses:
   *      200:
   *        description: success get detail booking
   *      401:
   *        description: only user can access this route
   *
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for update booking
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Booking ID
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            type: object
   *            properties:
   *              play_date_start:
   *                type: string
   *                format: date
   *                example: 2022-10-30 15:00:00
   *              play_date_end:
   *                type: string
   *                format: date
   *                example: 2022-10-30 17:00:00
   *              total_players:
   *                type: integer
   *                example: 18
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              play_date_start:
   *                type: string
   *                format: date
   *                example: 2022-10-30 15:00:00
   *              play_date_end:
   *                type: string
   *                format: date
   *                example: 2022-10-30 17:00:00
   *              total_players:
   *                type: integer
   *                example: 18
   *    responses:
   *      200:
   *        description: success get detail booking
   *      401:
   *        description: only user can access this route
   *
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for delete booking
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Booking ID
   *    responses:
   *      200:
   *        description: success get detail booking
   *      401:
   *        description: only user can access this route
   
   */

  public async show({ params, response }: HttpContextContract) {
    const booking = await Booking.query()
      .where("id", params.id)
      .preload("field", (query) => {
        query.preload("venue");
      })
      .preload("players", (userQuery) => {
        userQuery.select(["id", "name", "email"]);
      })
      .withCount("players")
      .firstOrFail();

    return response.ok({
      message: "succes get data booking with details",
      data: booking,
    });
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}/join:
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for join booking
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Booking ID
   *    responses:
   *      200:
   *        description: success join booking
   *      401:
   *        description: only user can access this route
   *      400:
   *        description: you cant join on this field
   *
   *
   */

  public async join({ auth, response, params }: HttpContextContract) {
    const data = await Booking.query()
      .where("id", params.id)
      .withCount("players")
      .firstOrFail();

    let players_count = data.$extras.players_count;
    let user = auth.user!;
    console.log(data);

    const booking = await Booking.findOrFail(params.id);

    if (players_count < booking.totalPlayers) {
      await booking.related("players").attach([user.id]);
      return response.ok({ message: "success join" });
    } else {
      return response.badRequest({ message: "you cannot join on this field" });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/bookings/{id}/unjoin:
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Booking
   *    description: Endpoint for unjoin booking
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Booking ID
   *    responses:
   *      200:
   *        description: success unjoin booking
   *      401:
   *        description: only user can access this route
   *
   */

  public async unjoin({ response, auth, params }: HttpContextContract) {
    const user = auth.user!;

    const booking = await Booking.findOrFail(params.id);

    await booking.related("players").detach([user.id]);

    return response.ok({ message: "success unjoin" });
  }

  /**
   * @swagger
   * /api/v1/schedules:
   *   get:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Booking
   *    description: Endpoint for get schedules from login user
   *    responses:
   *      200:
   *        description: Success get schedules
   *      400:
   *        description: Invalid request
   *      401:
   *        description: Only user can access this route
   */

  public async schedules({ response, auth }: HttpContextContract) {
    const user = auth.user!;

    let data = await User.query()
      .where("id", user.id)
      .preload("booking", (userQuery) => {
        userQuery
          .select(
            "field_id",
            "id",
            "play_date_start",
            "play_date_end",
            "total_players",
            "user_id"
          )
          .preload("field")
          .preload("players")

          .withCount("players");
      });

    return response.ok({ message: "succes get schedules", data });
  }

  public async update({
    request,
    response,
    auth,
    params,
  }: HttpContextContract) {
    const bookSchema = schema.create({
      play_date_start: schema.date({ format: "yyyy-MM-dd HH:mm:ss" }, [
        rules.unique({ table: "bookings", column: "play_date_start" }),
        rules.after("today"),
      ]),
      play_date_end: schema.date({ format: "yyyy-MM-dd HH:mm:ss" }, [
        rules.afterField("play_date_start"),
      ]),
      total_players: schema.number([rules.range(2, 20)]),
    });

    const user = auth.user!;
    const booking = await Booking.findByOrFail("id", params.id);

    if (user.id == booking.userId) {
      await request.validate({ schema: bookSchema });

      await booking
        .merge({
          playDateStart: request.input("play_date_start"),
          playDateEnd: request.input("play_date_end"),
          totalPlayers: request.input("total_players"),
        })
        .save();

      // booking.playDateStart = payload.play_date_start;
      // booking.playDateEnd = payload.play_date_end;
      // booking.totalPlayers = payload.total_players;
      // booking.fieldId = payload.field_id;

      // await booking.save();
      return response.ok({
        message: "Booking has been updated",
      });
    } else {
      return response.unauthorized({
        message: "you dont have permission to access this",
      });
    }
  }

  public async delete({ params, response, auth }: HttpContextContract) {
    const user = auth.user!;
    const booking = await Booking.findOrFail(params.id);

    if (booking.userId == user.id) {
      await booking.delete();
      return response.ok({ message: "booking has been deleted" });
    } else {
      return response.unauthorized({
        message: "you dont have permission to acces this",
      });
    }
  }
}
