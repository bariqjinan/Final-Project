import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Field from "App/Models/Field";
import Venue from "App/Models/Venue";
import FieldValidator from "App/Validators/FieldValidator";

export default class FieldsController {
  /**
   * @swagger
   * /api/v1/venues/{venue_id}/fields:
   *   post:
   *    security:
   *      - bearerAuth: []
   *    tags :
   *      - Field
   *    description: Endpoint for store field
   *    parameters:
   *      - name: venue_id
   *        description: Venue ID
   *        in: path
   *        required: true
   *        schema:
   *            type: integer
   *            minimum: 1
   *            example: 1
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Field'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Field'
   *    responses:
   *      201:
   *        description: Success store data field
   *      400:
   *        description: Invalid request
   *      401:
   *        description: Only owner can access this route
   *   get:
   *      security:
   *      - bearerAuth: []
   *      tags:
   *        - Field
   *      description: Endpoint to get all field data by venue_id
   *      parameters:
   *        - in: path
   *          name: venue_id
   *          required: true
   *          schema:
   *            type: integer
   *            minimun: 1
   *            example: 1
   *          description: The venue ID
   *      responses:
   *        200:
   *          description: Success get all data fields by venue_id
   *        400:
   *          description: Bad request
   *
   */

  public async index({ response, params }: HttpContextContract) {
    const venue_id = params.venue_id;

    let data = await Field.query()
      .where("venue_id", venue_id)
      .select("*")
      .preload("venue");
    return response.ok({ message: "success", data });
  }

  public async store({ request, response, params, auth }: HttpContextContract) {
    const user = auth.user!;
    const venue = await Venue.findByOrFail("id", params.venue_id);

    if (venue.userId == user.id) {
      let payload = await request.validate(FieldValidator);

      // const venue = await Venue.findOrFail("id", params.venue_id);
      // codenya error
      // await venue
      //   ?.related("fields")
      //   .create({ name: payload.name, type: payload.type });

      let newField = new Field();
      newField.name = payload.name;
      newField.type = payload.type;
      newField.venueId = params.venue_id;

      await newField.save();

      return response.created({ message: "success input field" });
    } else {
      return response.unauthorized({ message: "you cant access this" });
    }
  }

  /**
   *
   * @swagger
   * /api/v1/venues/{venue_id}/fields/{id}:
   *  get:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    description: Get detail data field by venue id and field id
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Venue ID
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The field ID
   *    responses:
   *      200:
   *        description: success get detail data field
   *      400:
   *        description: Bad Request
   *      404 :
   *        description: Row not found
   *
   *  put:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    description: Endpoint for update data field
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Venue ID
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The field ID
   *    requestBody:
   *      content:
   *        application/x-www-form-urlencoded:
   *          schema:
   *            $ref: '#definitions/Field'
   *        application/json:
   *          schema:
   *            $ref: '#definitions/Field'
   *    responses:
   *      200:
   *        description: success updated data field
   *      401:
   *        description: you cant access this
   *
   *  delete:
   *    security:
   *      - bearerAuth: []
   *    tags:
   *      - Field
   *    description: Endpoint to delete data field
   *    parameters:
   *      - in: path
   *        name: venue_id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The Venue ID
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: integer
   *          minimum: 1
   *          example: 1
   *        description: The field ID
   *    responses:
   *      200:
   *        description: success delete data field
   *      401:
   *        description: you cant access this
   
   *
   */

  public async show({ response, params }: HttpContextContract) {
    let data = await Field.query()
      .where("id", params.id)
      .andWhere("venue_id", params.venue_id)
      .select("*")
      .preload("venue")
      .firstOrFail();

    return response.ok({ message: "success", data });
  }

  public async update({
    response,
    request,
    params,
    auth,
  }: HttpContextContract) {
    let user = auth.user!;
    let venue = await Venue.findByOrFail("id", params.venue_id);

    if (venue.userId == user.id) {
      let payload = await request.validate(FieldValidator);

      let field = await Field.query()
        .where("id", params.id)
        .andWhere("venue_id", params.venue_id)
        .select("*")
        .firstOrFail();

      field.name = payload.name;
      field.type = payload.type;

      field.save();

      return response.ok({ message: "updated!!" });
    } else {
      return response.unauthorized({ message: "you cant access this" });
    }
  }

  public async destroy({ response, params, auth }: HttpContextContract) {
    const user = auth.user!;
    const venue = await Venue.findByOrFail("id", params.venue_id);

    if (venue.userId == user.id) {
      let field = await Field.query()
        .where("id", params.id)
        .andWhere("venue_id", params.venue_id)
        .select("*")
        .firstOrFail();

      await field.delete();

      return response.ok({ message: "deleted!!" });
    } else {
      return response.unauthorized({ message: "you cant access this" });
    }
  }
}
