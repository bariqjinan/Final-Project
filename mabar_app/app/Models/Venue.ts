import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Field from "./Field";

/**
 * @swagger
 * definitions:
 *  Venue:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *        example: SARAGA ITB
 *      address:
 *        type: string
 *        example: Jl. Siliwangi Dalam 3, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat
 *      phone:
 *        type: string
 *        example: '+6281382774295'
 *    required:
 *      - name
 *      - address
 *      - phone
 *
 */

export default class Venue extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public address: string;

  @column()
  public phone: string;

  @column()
  public userId: number;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  @belongsTo(() => User)
  public owner: BelongsTo<typeof User>;

  @hasMany(() => Field)
  public fields: HasMany<typeof Field>;
}
