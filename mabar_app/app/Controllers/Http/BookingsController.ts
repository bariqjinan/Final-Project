import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Booking from "App/Models/Booking";
import Field from "App/Models/Field";
import User from "App/Models/User";
import Venue from "App/Models/Venue";
import BookingValidator from "App/Validators/BookingValidator";

export default class BookingsController {
  public async index({ response }: HttpContextContract) {
    const booking = await Booking.query()
      .preload("field", (query) => {
        query.preload("venue");
      })
      .withCount("players");

    return response.ok({ message: "success get data booking", data: booking });
  }

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

  public async unjoin({ response, auth, params }: HttpContextContract) {
    const user = auth.user!;

    const booking = await Booking.findOrFail(params.id);

    await booking.related("players").detach([user.id]);

    return response.ok({ message: "success unjoin" });
  }

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
    const user = auth.user!;
    const booking = await Booking.findByOrFail("id", params.id);

    if (user.id == booking.userId) {
      await request.validate(BookingValidator);

      await booking
        .merge({
          playDateStart: request.input("play_date_start"),
          playDateEnd: request.input("play_date_end"),
          totalPlayers: request.input("total_players"),
          fieldId: request.input("field_id"),
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
