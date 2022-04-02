import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Field from "App/Models/Field";
import Venue from "App/Models/Venue";
import FieldValidator from "App/Validators/FieldValidator";

export default class FieldsController {
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
    let venue = await Venue.findByOrFail("user_id", user.id);

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
