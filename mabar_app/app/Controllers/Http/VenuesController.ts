import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Venue from "App/Models/Venue";
import VenueValidator from "App/Validators/VenueValidator";

export default class VenuesController {
  /**
   *
   * @swagger
   * /api/v1/venues:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Venue
   *    description: Endpoint for get all venues
   *    responses:
   *      200:
   *        description: success get data
   *      400:
   *        description: Bad request
   *  post:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Venue
   *    description: Endpoint for store venue
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Venue'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Venue'
   *    responses:
   *      201:
   *        description: success input new venue
   *      400:
   *        description: Invalid request
   *      401:
   *        description: only owner who can access this
   *
   *
   *
   */

  public async index({ response }: HttpContextContract) {
    const venue = await Venue.query().preload("fields");

    return response.ok({ message: "success get data", data: venue });
  }

  public async store({ request, response, auth }: HttpContextContract) {
    let user = auth.user!;
    let payload = await request.validate(VenueValidator);
    let newVenue = await Venue.create({
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      userId: user.id,
    });

    return response.created({
      message: "success input new venue",
    });
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Venue
   *    description: Endpoint to get detail venue by id venue
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
   *
   *    responses:
   *      200:
   *        description: get data by id success!!
   *      400:
   *        description: bad request
   *
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Venue
   *    description: Endpoint for update venue by id venue
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
   *            $ref: '#definitions/Venue'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Venue'
   *    responses:
   *      200:
   *        description: Venue updated success
   *      401:
   *        description: only owner who can access this
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Venue
   *    description: Endpoint for delete venue by id venue
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
   *    responses:
   *      200:
   *        description: Venue deleted success
   *      401:
   *        description: Only owner who can access this
   
   */

  public async show({ response, params }: HttpContextContract) {
    let venue = await Venue.query()
      .select("id", "name", "address", "phone", "user_id")
      .preload("fields", (bookQuery) => {
        bookQuery.preload("bookings", (playersQuery) => {
          playersQuery.preload("players");
        });
      })
      .where("id", params.id)
      .firstOrFail();
    response.ok({ message: "get data by id success!!", data: venue });
  }

  public async update({
    auth,
    request,
    response,
    params,
  }: HttpContextContract) {
    const user = auth.user!;
    const checkVenue = await Venue.findByOrFail("id", params.id);

    if (checkVenue.userId == user.id) {
      const payload = await request.validate(VenueValidator);

      let venue = await Venue.query()
        .where("user_id", user.id)
        .andWhere("id", params.id)
        .select("*")
        .firstOrFail();

      venue.name = payload.name;
      venue.address = payload.address;
      venue.phone = payload.phone;

      await venue.save();

      return response.ok({
        message: `the venue with id ${venue.id} has been updated!!`,
      });
    } else {
      return response.unauthorized({
        message: "you dont have permission to access this",
      });
    }
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const user = auth.user!;
    let venue = await Venue.findByOrFail("id", params.id);

    if (venue.userId == user.id) {
      await Venue.query()
        .where("user_id", user.id)
        .andWhere("id", params.id)
        .delete()
        .firstOrFail();
      return response.ok({ message: "deleted!!" });
    } else {
      return response.unauthorized({
        message: "you dont have permission to access this",
      });
    }
  }
}
