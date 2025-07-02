export interface ISoftDeletable {
	deleted: boolean;
	deletedBy: string | null;
	deletedAt: Date | null;
}
