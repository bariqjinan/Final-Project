import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Venue from "./Venue";
import Booking from "./Booking";

/**
 * @swagger
 * definitions:
 *  User:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *      name:
 *        type: string
 *        minLength: 5
 *        example: bariq
 *      email:
 *        type: string
 *        format: email
 *        example: bariq@gmail.com
 *      password:
 *        type: string
 *        minLength: 5
 *        example: bariq123
 *      role:
 *        type: string
 *        enum:
 *          - user
 *          - owner
 *
 *    required:
 *      - name
 *      - email
 *      - password
 *      - role
 *
 */

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public role: string;

  @column({ serializeAs: null })
  public isVerified: boolean;

  @column({ serializeAs: null })
  public rememberMeToken?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasMany(() => Venue)
  public venues: HasMany<typeof Venue>;

  @hasMany(() => Booking)
  public bookings: HasMany<typeof Booking>;

  @manyToMany(() => Booking, {
    pivotTable: "booking_users",
  })
  public booking: ManyToMany<typeof Booking>;
}
