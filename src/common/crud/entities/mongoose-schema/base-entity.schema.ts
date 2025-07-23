import { Schema, Virtual } from '@nestjs/mongoose';

import { Complete } from '@common/types/utils';

import { IBaseEntity } from '../base-entity.type';
import { WithPopulated } from '../type-with-populated.type';

@Schema()
export class BaseEntitySchemaDef implements WithPopulated<Complete<IBaseEntity>> {
	_id!: string;
	@Virtual({
		get: function (this: BaseEntitySchemaDef) {
			return this._id.toString();
		},
	})
	id!: string;

	createdAt!: Date;
	updatedAt!: Date;
}
