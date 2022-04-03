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
