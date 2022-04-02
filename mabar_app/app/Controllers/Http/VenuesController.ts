import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Venue from "App/Models/Venue";
import VenueValidator from "App/Validators/VenueValidator";

export default class VenuesController {
  public async index({ response, auth }: HttpContextContract) {
    let user = auth.user!;
    const venue = await Venue.findBy("userId", user.id);

    return response.ok({ message: "succes get data", data: venue });
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
      message: "success input new venuw",
      newVenueId: newVenue.id,
    });
  }

  public async show({ response, params }: HttpContextContract) {
    let venue = await Venue.query()
      .select("id", "name", "adrress", "phone", "user_id")
      .preload("fields")
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
    }
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const user = auth.user!;

    await Venue.query()
      .where("user_id", user.id)
      .andWhere("id", params.id)
      .delete()
      .firstOrFail();
    return response.ok({ message: "deleted!!" });
  }
}