import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Field from "./Field";
import User from "./User";

/**
 * @swagger
 * definitions:
 *  Booking:
 *    type: object
 *    properties:
 *      field_id:
 *        type: integer
 *        example: 1
 *      play_date_start:
 *        type: string
 *        format: date
 *        example: 2022-10-30 15:00:00
 *      play_date_end:
 *        type: string
 *        format: date
 *        example: 2022-10-30 16:00:00
 *      total_players:
 *        type: integer
 *        example: 20
 *    required:
 *      - field_id
 *      - play_date_start
 *      - play_date_end
 *      - total_players
 *
 */

export default class Booking extends BaseModel {
  public serializeExtras() {
    return {
      players_count: this.$extras.players_count,
    };
  }

  @column({ isPrimary: true })
  public id: number;

  @column()
  public fieldId: number;

  @column()
  public playDateStart: DateTime;

  @column()
  public playDateEnd: DateTime;

  @column()
  public totalPlayers: number;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => Field)
  public field: BelongsTo<typeof Field>;

  @belongsTo(() => User)
  public bookingUser: BelongsTo<typeof User>;

  @manyToMany(() => User, {
    pivotTable: "booking_users",
  })
  public players: ManyToMany<typeof User>;
}
