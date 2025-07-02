import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Report {
	@Prop({ required: true })
	reporterId: string; // ai gửi report

	@Prop({ required: true })
	targetId: string; // report ai (userId hoặc postId)

	@Prop({ required: true, enum: ['USER', 'POST'] })
	targetType: 'USER' | 'POST';

	@Prop()
	reason: string; // lý do

	@Prop()
	description: string; // mô tả chi tiết

	@Prop({ default: false })
	resolved: boolean; // đã xử lý chưa
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ reporterId: 1, targetId: 1, targetType: 1 }, { unique: true });
