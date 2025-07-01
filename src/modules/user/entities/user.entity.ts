import { Level, Role, Status } from '@common/enums';

export type Location = {
	province: string | null;
	city: string | null;
	hidden: boolean;
};

export type Sport = {
	name: string;
	level: Level;
};

export type GoogleLoginInfo = {
	id: string | null;
};

export class User {
	id!: string;
	username!: string;
	// compromise mail, phone and password being null for google oauth2 login
	password!: string | null;
	roles!: Role[];
	mail!: string | null;
	phone!: string | null;
	avatarUrl!: string | null;
	location!: Location;
	sports!: Sport[];
	status!: Status;
	// after registration user needs to setup (finish filling the other required field)
	hasFinishedSetup!: boolean;
	// auto generated fields
	createdAt!: Date;
	updatedAt!: Date;
	deleted!: boolean;
	deletedAt!: Date | null;
	deletedBy!: string | null;
	// social login info
	googleLoginInfo!: GoogleLoginInfo | null;
}
