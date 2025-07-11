import {
	AbilityBuilder,
	ExtractSubjectType,
	InferSubjects,
	MongoAbility,
	createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

import { Action, Role, Visibility } from '@common/enums';

import { Sub } from '@modules/auth/types';
import { Comment } from '@modules/comment/entities';
import { SocialPost } from '@modules/post/entities';
import { User } from '@modules/user/entities';

type Subjects = InferSubjects<typeof User | typeof SocialPost | typeof Comment> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: Sub) {
		const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

		if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.MODERATOR)) {
			can(Action.MANAGE, User);
			can(Action.MANAGE, SocialPost);
			can(Action.MANAGE, Comment);
		} else {
			// user on USERS
			cannot(Action.CREATE, User);
			can(Action.READ, User);
			can([Action.UPDATE, Action.DELETE], User, {
				id: new mongoose.Types.ObjectId(user.id) as unknown as string,
			});
			// user on SOCIAL POSTS
			{
				// cant interact with deleted post
				cannot(Action.MANAGE, SocialPost, { deleted: true });
				// can manage own post
				can(Action.MANAGE, SocialPost, {
					userId: new mongoose.Types.ObjectId(user.id) as unknown as string,
				});
				// can create post
				can(Action.CREATE, SocialPost);
				// privacy for read
				can(Action.READ, SocialPost, { visibility: Visibility.PUBLIC });
				can(Action.READ, SocialPost, {
					visibility: Visibility.LIMITED,
					visibleToUsersIds: {
						$in: [new mongoose.Types.ObjectId(user.id) as unknown as string],
					},
				});
				// cannot update, delete others' post
				cannot([Action.UPDATE, Action.DELETE], SocialPost, {
					userId: { $ne: new mongoose.Types.ObjectId(user.id) as unknown as string },
				});
			}
			// user on COMMENTS
			{
				// can manage own comment
				can(Action.MANAGE, Comment, {
					userId: new mongoose.Types.ObjectId(user.id) as unknown as string,
				});
				// can create and read whatever
				can([Action.CREATE, Action.READ], Comment);
				// cant update, delete others'
				cannot([Action.UPDATE, Action.DELETE], Comment, {
					userId: { $ne: new mongoose.Types.ObjectId(user.id) as unknown as string },
				});
			}
		}

		return build({
			detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
