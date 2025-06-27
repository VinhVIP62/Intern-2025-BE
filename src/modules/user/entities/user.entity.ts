import { Level, Role, Status } from '@common/enum';

export class Location {
	province: string | null = null;
	city: string | null = null;
	hidden: boolean = false;
}

export class Sport {
	name: string;
	level: Level;
}

export class User {
	_id: string;
	username: string;
	password: string;
	roles: Role[];
	mail: string;
	phone: string;
	avatarUrl: string | null = null;
	location: Location;
	sports: Sport[] = [];
	status: Status;
	// after registration user needs to setup (finish filling the other required field)
	hasFinishedSetup: boolean = false;
	// auto generated fields
	createdAt: Date;
	updatedAt: Date;
	deleted: boolean;
	deletedBy: string;
}
